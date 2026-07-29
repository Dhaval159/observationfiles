import type {
  ObservationGroupDefinition,
  ObservationGroupState,
  ObservationContext,
  ObservationLifecycleState,
} from "../types";
import type { DomainTimestamp } from "@/domain/value-objects/timestamp";
import { now } from "@/domain/value-objects/timestamp";

export class GroupManager {
  private _groups: Map<string, ObservationGroupDefinition> = new Map();
  private _states: Map<string, ObservationGroupState> = new Map();

  registerGroup(group: ObservationGroupDefinition): void {
    this._groups.set(group.id, group);

    if (!this._states.has(group.id)) {
      const state: ObservationGroupState = {
        groupId: group.id,
        observedCount: 0,
        totalCount: group.observationIds.length,
        isComplete: false,
        completedAt: null,
        observationStates: {},
      };
      for (const obsId of group.observationIds) {
        state.observationStates[obsId] = "hidden";
      }
      this._states.set(group.id, state);
    }
  }

  removeGroup(groupId: string): void {
    this._groups.delete(groupId);
    this._states.delete(groupId);
  }

  getGroup(groupId: string): ObservationGroupDefinition | undefined {
    return this._groups.get(groupId);
  }

  getGroupState(groupId: string): ObservationGroupState | undefined {
    return this._states.get(groupId);
  }

  getAllGroups(): ObservationGroupDefinition[] {
    return Array.from(this._groups.values());
  }

  getAllGroupStates(): ObservationGroupState[] {
    return Array.from(this._states.values());
  }

  getGroupsForObservation(observationId: string): ObservationGroupDefinition[] {
    return this.getAllGroups().filter((g) => g.observationIds.includes(observationId));
  }

  getChildGroups(parentGroupId: string): ObservationGroupDefinition[] {
    return this.getAllGroups().filter((g) => g.parentGroupId === parentGroupId);
  }

  getRootGroups(): ObservationGroupDefinition[] {
    return this.getAllGroups().filter((g) => g.parentGroupId === null);
  }

  getVirtualGroups(): ObservationGroupDefinition[] {
    return this.getAllGroups().filter((g) => g.isVirtual);
  }

  updateObservationState(
    groupId: string,
    observationId: string,
    state: ObservationLifecycleState,
    timestamp?: DomainTimestamp,
  ): void {
    const groupState = this._states.get(groupId);
    if (!groupState) return;

    groupState.observationStates[observationId] = state;

    let observedCount = 0;
    for (const s of Object.values(groupState.observationStates)) {
      if (s === "observed" || s === "verified") {
        observedCount++;
      }
    }

    const isComplete = observedCount >= (this._groups.get(groupId)?.requiredCount ?? 0);

    this._states.set(groupId, {
      ...groupState,
      observedCount,
      isComplete,
      completedAt: isComplete && !groupState.isComplete ? (timestamp ?? now()) : groupState.completedAt,
    });
  }

  isGroupComplete(groupId: string): boolean {
    return this._states.get(groupId)?.isComplete ?? false;
  }

  getGroupProgress(groupId: string): { observed: number; total: number; percentage: number } {
    const state = this._states.get(groupId);
    if (!state) return { observed: 0, total: 0, percentage: 0 };

    return {
      observed: state.observedCount,
      total: state.totalCount,
      percentage: state.totalCount > 0 ? Math.round((state.observedCount / state.totalCount) * 100) : 0,
    };
  }

  applyFilter(filterExpression: string | null, groups: ObservationGroupDefinition[]): ObservationGroupDefinition[] {
    if (!filterExpression) return groups;

    const [field, op, value] = filterExpression.split(":");

    return groups.filter((g) => {
      switch (field) {
        case "tag":
          if (op === "has" && value) return g.tags.includes(value);
          if (op === "not_has" && value) return !g.tags.includes(value);
          return false;
        case "name":
          if (op === "contains" && value) return g.name.toLowerCase().includes(value.toLowerCase());
          if (op === "starts_with" && value) return g.name.toLowerCase().startsWith(value.toLowerCase());
          return false;
        case "requiredCount":
          if (op === "eq" && value) return g.requiredCount === Number(value);
          if (op === "gt" && value) return g.requiredCount > Number(value);
          if (op === "lt" && value) return g.requiredCount < Number(value);
          return false;
        default:
          return true;
      }
    });
  }

  getOrderedGroups(): ObservationGroupDefinition[] {
    return [...this.getAllGroups()].sort((a, b) => a.order - b.order);
  }

  syncToContext(ctx: ObservationContext): void {
    ctx.groups.clear();
    ctx.groupStates.clear();
    for (const [id, group] of this._groups) {
      ctx.groups.set(id, group);
    }
    for (const [id, state] of this._states) {
      ctx.groupStates.set(id, state);
    }
  }

  syncFromContext(ctx: ObservationContext): void {
    this._groups.clear();
    this._states.clear();
    for (const [id, group] of ctx.groups) {
      this._groups.set(id, group);
    }
    for (const [id, state] of ctx.groupStates) {
      this._states.set(id, state);
    }
  }

  clear(): void {
    this._groups.clear();
    this._states.clear();
  }
}
