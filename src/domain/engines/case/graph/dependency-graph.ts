import type { CaseDefinition } from "@/types/case";
import type { DependencyGraph, DependencyNode, DependencyEdge, DependencyNodeType } from "../types";

export function createDependencyGraph(): DependencyGraph {
  const nodes = new Map<string, DependencyNode>();
  const edges: DependencyEdge[] = [];

  return {
    nodes,
    edges,

    isCyclic(): boolean {
      const result = this.validate();
      return result.cycles.length > 0;
    },

    getDependencies(nodeId: string): string[] {
      return edges
        .filter((e) => e.from === nodeId && (e.type === "requires" || e.type === "precedes"))
        .map((e) => e.to);
    },

    getDependents(nodeId: string): string[] {
      return edges
        .filter((e) => e.to === nodeId || (e.from !== nodeId && e.to === nodeId && e.type === "blocks"))
        .map((e) => e.from);
    },

    getCriticalPath(): string[] {
      const visited = new Set<string>();
      const path: string[] = [];

      const dfs = (nodeId: string, currentPath: string[]): string[] => {
        if (visited.has(nodeId)) return currentPath;
        visited.add(nodeId);
        let longestPath = [...currentPath, nodeId];

        for (const dep of this.getDependencies(nodeId)) {
          if (!nodes.has(dep)) continue;
          const depNode = nodes.get(dep);
          if (depNode?.isRequired) {
            const altPath = dfs(dep, [...currentPath, nodeId]);
            if (altPath.length > longestPath.length) {
              longestPath = altPath;
            }
          }
        }

        return longestPath;
      };

      for (const [nodeId] of nodes) {
        const candidatePath = dfs(nodeId, []);
        if (candidatePath.length > path.length) {
          path.length = 0;
          path.push(...candidatePath);
        }
      }

      return path;
    },

    getTopologicalOrder(): string[] {
      const result = this.validate();
      if (result.cycles.length > 0) return [];

      const inDegree = new Map<string, number>();
      const order: string[] = [];

      for (const nodeId of nodes.keys()) {
        inDegree.set(nodeId, 0);
      }
      for (const edge of edges) {
        if (edge.type === "requires" || edge.type === "precedes") {
          inDegree.set(edge.to, (inDegree.get(edge.to) ?? 0) + 1);
        }
      }

      const queue: string[] = [];
      for (const [nodeId, degree] of inDegree) {
        if (degree === 0) queue.push(nodeId);
      }

      while (queue.length > 0) {
        const nodeId = queue.shift()!;
        order.push(nodeId);
        for (const edge of edges) {
          if (edge.from === nodeId && (edge.type === "requires" || edge.type === "precedes")) {
            const newDegree = (inDegree.get(edge.to) ?? 1) - 1;
            inDegree.set(edge.to, newDegree);
            if (newDegree === 0) queue.push(edge.to);
          }
        }
      }

      return order.length === nodes.size ? order : [];
    },

    addNode(node: DependencyNode): void {
      nodes.set(node.id, node);
    },

    addEdge(edge: DependencyEdge): void {
      if (!nodes.has(edge.from) || !nodes.has(edge.to)) return;
      const exists = edges.some(
        (e) => e.from === edge.from && e.to === edge.to && e.type === edge.type,
      );
      if (!exists) edges.push(edge);
    },

    removeNode(nodeId: string): void {
      nodes.delete(nodeId);
      for (let i = edges.length - 1; i >= 0; i--) {
        const edge = edges[i];
        if (edge && (edge.from === nodeId || edge.to === nodeId)) {
          edges.splice(i, 1);
        }
      }
    },

    validate(): { isValid: boolean; cycles: string[][] } {
      const cycles: string[][] = [];
      const WHITE = 0;
      const GRAY = 1;
      const BLACK = 2;
      const color = new Map<string, number>();

      for (const nodeId of nodes.keys()) {
        color.set(nodeId, WHITE);
      }

      const path: string[] = [];

      const dfs = (nodeId: string): boolean => {
        const currentColor = color.get(nodeId);
        if (currentColor === GRAY) {
          const cycleStart = path.indexOf(nodeId);
          if (cycleStart >= 0) {
            cycles.push([...path.slice(cycleStart), nodeId]);
          }
          return true;
        }
        if (currentColor === BLACK) return false;

        color.set(nodeId, GRAY);
        path.push(nodeId);

        for (const edge of edges) {
          if (edge.from === nodeId && (edge.type === "requires" || edge.type === "precedes")) {
            dfs(edge.to);
          }
        }

        path.pop();
        color.set(nodeId, BLACK);
        return false;
      };

      for (const nodeId of nodes.keys()) {
        if (color.get(nodeId) === WHITE) {
          dfs(nodeId);
        }
      }

      return { isValid: cycles.length === 0, cycles };
    },
  };
}

export function createDependencyNode(
  id: string,
  type: DependencyNodeType,
  label: string,
  options?: {
    isRequired?: boolean;
    metadata?: Record<string, unknown>;
  },
): DependencyNode {
  return {
    id,
    type,
    label,
    isRequired: options?.isRequired ?? false,
    isSatisfied: false,
    metadata: options?.metadata ?? {},
  };
}

export function createDependencyEdge(
  from: string,
  to: string,
  type: DependencyEdge["type"],
  options?: { weight?: number },
): DependencyEdge {
  return {
    from,
    to,
    type,
    weight: options?.weight ?? 1,
  };
}

export function buildGraphFromCaseDefinition(
  graph: DependencyGraph,
  definition: CaseDefinition,
): void {
  if (definition.chapters) {
    for (const chapter of definition.chapters) {
      graph.addNode(createDependencyNode(chapter.id, "chapter", chapter.title, { isRequired: true }));
    }

    for (let i = 1; i < definition.chapters.length; i++) {
      const prev = definition.chapters[i - 1];
      const curr = definition.chapters[i];
      if (prev && curr) {
        graph.addEdge(createDependencyEdge(prev.id, curr.id, "precedes"));
      }
    }
  }

  if (definition.objectives) {
    for (const obj of definition.objectives) {
      graph.addNode(createDependencyNode(
        obj.id,
        "objective",
        obj.description,
        { isRequired: obj.type === "primary" },
      ));
    }
  }
}
