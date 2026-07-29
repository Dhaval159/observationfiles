import type { ObservationDependencyDefinition, ObservationDependencyNode, ObservationContext } from "../types";
import type { DomainTimestamp } from "@/domain/value-objects/timestamp";
import { now } from "@/domain/value-objects/timestamp";

export class DependencyGraph {
  private _nodes: Map<string, ObservationDependencyNode> = new Map();
  private _adjacencyList: Map<string, Set<string>> = new Map();

  addNode(observationId: string, dependencies: ObservationDependencyDefinition[]): void {
    const node: ObservationDependencyNode = {
      observationId,
      dependencies: [...dependencies],
      dependents: [],
      isSatisfied: false,
      satisfiedAt: null,
    };

    this._nodes.set(observationId, node);

    if (!this._adjacencyList.has(observationId)) {
      this._adjacencyList.set(observationId, new Set());
    }

    for (const dep of dependencies) {
      if (!this._adjacencyList.has(dep.dependsOnId)) {
        this._adjacencyList.set(dep.dependsOnId, new Set());
      }
      this._adjacencyList.get(dep.dependsOnId)!.add(observationId);
    }
  }

  removeNode(observationId: string): void {
    this._nodes.delete(observationId);
    this._adjacencyList.delete(observationId);
    for (const [, deps] of this._adjacencyList) {
      deps.delete(observationId);
    }
  }

  markSatisfied(observationId: string, timestamp?: DomainTimestamp): void {
    const node = this._nodes.get(observationId);
    if (!node) return;

    const updatedNode: ObservationDependencyNode = {
      ...node,
      isSatisfied: true,
      satisfiedAt: timestamp ?? now(),
    };
    this._nodes.set(observationId, updatedNode);

    for (const [, deps] of this._adjacencyList) {
      for (const depId of deps) {
        const targetNode = this._nodes.get(depId);
        if (targetNode) {
          const allMandatorySatisfied = targetNode.dependencies
            .filter((d) => d.isMandatory)
            .every((d) => this._nodes.get(d.dependsOnId)?.isSatisfied ?? false);
          if (allMandatorySatisfied) {
            this._nodes.set(depId, { ...targetNode, isSatisfied: true, satisfiedAt: timestamp ?? now() });
          }
        }
      }
    }
  }

  markUnsatisfied(observationId: string): void {
    const node = this._nodes.get(observationId);
    if (!node) return;

    this._nodes.set(observationId, { ...node, isSatisfied: false, satisfiedAt: null });

    for (const [, deps] of this._adjacencyList) {
      for (const depId of deps) {
        const targetNode = this._nodes.get(depId);
        if (targetNode) {
          const allMandatorySatisfied = targetNode.dependencies
            .filter((d) => d.isMandatory)
            .every((d) => this._nodes.get(d.dependsOnId)?.isSatisfied ?? false);
          if (!allMandatorySatisfied) {
            this._nodes.set(depId, { ...targetNode, isSatisfied: false, satisfiedAt: null });
          }
        }
      }
    }
  }

  areDependenciesSatisfied(observationId: string): boolean {
    const node = this._nodes.get(observationId);
    if (!node) return true;

    return node.dependencies
      .filter((d) => d.isMandatory)
      .every((d) => {
        const depNode = this._nodes.get(d.dependsOnId);
        return depNode?.isSatisfied ?? false;
      });
  }

  getUnsatisfiedDependencies(observationId: string): string[] {
    const node = this._nodes.get(observationId);
    if (!node) return [];

    return node.dependencies
      .filter((d) => d.isMandatory)
      .filter((d) => !(this._nodes.get(d.dependsOnId)?.isSatisfied ?? false))
      .map((d) => d.dependsOnId);
  }

  getDependents(observationId: string): string[] {
    return Array.from(this._adjacencyList.get(observationId) ?? []);
  }

  getDependencies(observationId: string): ObservationDependencyDefinition[] {
    return this._nodes.get(observationId)?.dependencies ?? [];
  }

  hasCycle(observationId: string, dependencyId: string): boolean {
    const visited = new Set<string>();
    const stack = [dependencyId];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (current === observationId) return true;
      if (visited.has(current)) continue;
      visited.add(current);

      const deps = this._adjacencyList.get(current);
      if (deps) {
        for (const dep of deps) {
          stack.push(dep);
        }
      }
    }

    return false;
  }

  detectCycles(): string[][] {
    const cycles: string[][] = [];
    const WHITE = 0;
    const GRAY = 1;
    const BLACK = 2;
    const colors = new Map<string, number>();

    for (const id of this._nodes.keys()) {
      colors.set(id, WHITE);
    }

    const dfs = (nodeId: string, path: string[]): void => {
      colors.set(nodeId, GRAY);
      path.push(nodeId);

      const deps = this._nodes.get(nodeId)?.dependencies ?? [];
      for (const dep of deps) {
        const color = colors.get(dep.dependsOnId) ?? WHITE;
        if (color === GRAY) {
          const cycleStart = path.indexOf(dep.dependsOnId);
          if (cycleStart >= 0) {
            cycles.push(path.slice(cycleStart));
          }
        } else if (color === WHITE) {
          dfs(dep.dependsOnId, [...path]);
        }
      }

      colors.set(nodeId, BLACK);
    };

    for (const id of this._nodes.keys()) {
      if (colors.get(id) === WHITE) {
        dfs(id, []);
      }
    }

    return cycles;
  }

  getCriticalPath(): string[] {
    const inDegree = new Map<string, number>();
    const queue: string[] = [];
    const distances = new Map<string, number>();

    for (const id of this._nodes.keys()) {
      inDegree.set(id, 0);
      distances.set(id, 0);
    }

    for (const [, deps] of this._adjacencyList) {
      for (const dep of deps) {
        inDegree.set(dep, (inDegree.get(dep) ?? 0) + 1);
      }
    }

    for (const [id, degree] of inDegree) {
      if (degree === 0) {
        queue.push(id);
        distances.set(id, 1);
      }
    }

    let maxDistance = 0;
    let farthestNode = "";

    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentDist = distances.get(current) ?? 0;

      if (currentDist > maxDistance) {
        maxDistance = currentDist;
        farthestNode = current;
      }

      const deps = this._adjacencyList.get(current);
      if (deps) {
        for (const dep of deps) {
          const newDist = currentDist + 1;
          if (newDist > (distances.get(dep) ?? 0)) {
            distances.set(dep, newDist);
          }
          const newDegree = (inDegree.get(dep) ?? 1) - 1;
          inDegree.set(dep, newDegree);
          if (newDegree === 0) {
            queue.push(dep);
          }
        }
      }
    }

    const path: string[] = [];
    let current = farthestNode;
    while (current) {
      path.unshift(current);
      const currentDist = distances.get(current) ?? 0;
      if (currentDist <= 1) break;

      let prev = "";
      for (const [id, deps] of this._adjacencyList) {
        if (deps.has(current) && (distances.get(id) ?? 0) === currentDist - 1) {
          prev = id;
          break;
        }
      }
      current = prev;
    }

    return path;
  }

  getAllNodes(): ObservationDependencyNode[] {
    return Array.from(this._nodes.values());
  }

  getNode(observationId: string): ObservationDependencyNode | undefined {
    return this._nodes.get(observationId);
  }

  syncToContext(ctx: ObservationContext): void {
    ctx.dependencyNodes.clear();
    for (const [id, node] of this._nodes) {
      ctx.dependencyNodes.set(id, node);
    }
  }

  syncFromContext(ctx: ObservationContext): void {
    this._nodes.clear();
    this._adjacencyList.clear();
    for (const [id, node] of ctx.dependencyNodes) {
      this._nodes.set(id, node);
    }
  }

  clear(): void {
    this._nodes.clear();
    this._adjacencyList.clear();
  }

  get size(): number {
    return this._nodes.size;
  }
}
