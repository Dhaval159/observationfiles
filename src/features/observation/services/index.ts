import type { EventEmitter } from "@/types/engine";
import type {
  ObservationDefinition,
  ObservationState,
  ObservationObjectDefinition,
  ObservationSearchCriteria,
  ObservationCondition,
} from "@/types/observation";
import type {
  ObservationEngineState,
  ObservationDiscoveryResult,
  ObservationFilterResult,
} from "../types";
import { filterObservations } from "../utils";

export class ObservationEngine {
  private emitter: EventEmitter;
  private state: ObservationEngineState;

  constructor(emitter: EventEmitter) {
    this.emitter = emitter;
    this.state = {
      objects: new Map(),
      observations: new Map(),
      playerState: new Map(),
      discoveredCount: 0,
      totalCount: 0,
      analyzedCount: 0,
      lastDiscoveredAt: null,
    };
  }

  loadDefinitions(
    objects: ObservationObjectDefinition[],
    observations: ObservationDefinition[],
  ): void {
    this.state.objects.clear();
    this.state.observations.clear();
    this.state.totalCount = observations.length;

    for (const obj of objects) {
      this.state.objects.set(obj.id, obj);
    }

    for (const obs of observations) {
      this.state.observations.set(obs.id, obs);
    }
  }

  getObject(objectId: string): ObservationObjectDefinition | null {
    return this.state.objects.get(objectId) ?? null;
  }

  getObjectsAtLocation(locationId: string): ObservationObjectDefinition[] {
    const result: ObservationObjectDefinition[] = [];
    for (const obj of this.state.objects.values()) {
      if (obj.locationId === locationId) {
        result.push(obj);
      }
    }
    return result;
  }

  getObservationsForObject(objectId: string): ObservationDefinition[] {
    const result: ObservationDefinition[] = [];
    for (const obs of this.state.observations.values()) {
      if (obs.objectId === objectId) {
        result.push(obs);
      }
    }
    return result;
  }

  discoverObservation(
    observationId: string,
    context: Record<string, unknown>,
  ): ObservationDiscoveryResult {
    const observation = this.state.observations.get(observationId);
    if (!observation) {
      throw new Error(`Observation "${observationId}" not found`);
    }

    if (!this.checkConditions(observation.conditions, context)) {
      throw new Error(`Observation "${observationId}" visibility conditions not met`);
    }

    if (!this.areDependenciesMet(observationId)) {
      throw new Error(`Observation "${observationId}" has unmet dependencies`);
    }

    const existingState = this.state.playerState.get(observationId);
    const wasNew = !existingState?.isDiscovered;
    const now = new Date().toISOString();

    const playerState: ObservationState = {
      observationId,
      isDiscovered: true,
      discoveredAt: wasNew ? now : (existingState?.discoveredAt ?? now),
      isAnalyzed: existingState?.isAnalyzed ?? false,
      analyzedAt: existingState?.analyzedAt ?? null,
      playerNotes: existingState?.playerNotes ?? "",
      confidenceLevel: (existingState?.confidenceLevel ?? 0) + observation.confidenceGain,
      isPinned: existingState?.isPinned ?? false,
    };

    this.state.playerState.set(observationId, playerState);

    if (wasNew) {
      this.state.discoveredCount++;
      this.state.lastDiscoveredAt = now;
    }

    const unlockedDeductions = this.processDeductionUnlocks(observationId);

    this.emitter.emit("observation_discovered", {
      observationId,
      wasNew,
      unlockedDeductions,
      confidenceChange: observation.confidenceGain,
    });

    return {
      observation,
      wasNew,
      unlockedDeductions,
      confidenceChange: observation.confidenceGain,
    };
  }

  analyzeObservation(observationId: string): void {
    const state = this.state.playerState.get(observationId);
    if (!state) {
      throw new Error(`Observation "${observationId}" has no player state`);
    }

    const now = new Date().toISOString();
    const updated: ObservationState = {
      ...state,
      isAnalyzed: true,
      analyzedAt: now,
    };

    this.state.playerState.set(observationId, updated);
    this.state.analyzedCount++;

    this.emitter.emit("observation_analyzed", {
      observationId,
      analyzedAt: now,
    });
  }

  isObservationAvailable(observationId: string, context: Record<string, unknown>): boolean {
    const observation = this.state.observations.get(observationId);
    if (!observation) return false;

    if (!this.checkConditions(observation.conditions, context)) {
      return false;
    }

    if (!this.areDependenciesMet(observationId)) {
      return false;
    }

    return true;
  }

  checkConditions(conditions: ObservationCondition[], context: Record<string, unknown>): boolean {
    if (conditions.length === 0) return true;

    return conditions.every((condition) => this.evaluateCondition(condition, context));
  }

  getDiscoveredObservations(): ObservationDefinition[] {
    const result: ObservationDefinition[] = [];
    for (const [id, obs] of this.state.observations) {
      const playerState = this.state.playerState.get(id);
      if (playerState?.isDiscovered) {
        result.push(obs);
      }
    }
    return result;
  }

  getUndiscoveredObservations(): ObservationDefinition[] {
    const result: ObservationDefinition[] = [];
    for (const [id, obs] of this.state.observations) {
      const playerState = this.state.playerState.get(id);
      if (!playerState?.isDiscovered) {
        result.push(obs);
      }
    }
    return result;
  }

  getDiscoverableObservations(context: Record<string, unknown>): ObservationDefinition[] {
    const undiscovered = this.getUndiscoveredObservations();
    return undiscovered.filter((obs) => this.isObservationAvailable(obs.id, context));
  }

  getAnalyzedObservations(): ObservationDefinition[] {
    const result: ObservationDefinition[] = [];
    for (const [id, obs] of this.state.observations) {
      const playerState = this.state.playerState.get(id);
      if (playerState?.isAnalyzed) {
        result.push(obs);
      }
    }
    return result;
  }

  getState(): ObservationEngineState {
    return this.state;
  }

  getObservationState(observationId: string): ObservationState | null {
    return this.state.playerState.get(observationId) ?? null;
  }

  setPlayerNotes(observationId: string, notes: string): void {
    const state = this.state.playerState.get(observationId);
    if (!state) {
      this.state.playerState.set(observationId, {
        observationId,
        isDiscovered: false,
        discoveredAt: null,
        isAnalyzed: false,
        analyzedAt: null,
        playerNotes: notes,
        confidenceLevel: 0,
        isPinned: false,
      });
      return;
    }

    this.state.playerState.set(observationId, {
      ...state,
      playerNotes: notes,
    });
  }

  pinObservation(observationId: string): void {
    const state = this.state.playerState.get(observationId);
    if (!state) return;

    this.state.playerState.set(observationId, {
      ...state,
      isPinned: true,
    });
  }

  unpinObservation(observationId: string): void {
    const state = this.state.playerState.get(observationId);
    if (!state) return;

    this.state.playerState.set(observationId, {
      ...state,
      isPinned: false,
    });
  }

  getPinnedObservations(): ObservationState[] {
    const result: ObservationState[] = [];
    for (const state of this.state.playerState.values()) {
      if (state.isPinned) {
        result.push(state);
      }
    }
    return result;
  }

  search(criteria: ObservationSearchCriteria): ObservationFilterResult {
    const allObservations = Array.from(this.state.observations.values());
    const filtered = filterObservations(allObservations, criteria, (id) =>
      this.state.playerState.get(id),
    );

    return {
      observations: filtered,
      total: allObservations.length,
      filtered: filtered.length,
    };
  }

  getConfidenceLevel(observationId: string): number {
    const state = this.state.playerState.get(observationId);
    return state?.confidenceLevel ?? 0;
  }

  getDiscoveryProgress(): {
    discovered: number;
    total: number;
    percentage: number;
    analyzed: number;
    analyzedPercentage: number;
  } {
    const { discoveredCount, totalCount, analyzedCount } = this.state;
    return {
      discovered: discoveredCount,
      total: totalCount,
      percentage: totalCount > 0 ? (discoveredCount / totalCount) * 100 : 0,
      analyzed: analyzedCount,
      analyzedPercentage: totalCount > 0 ? (analyzedCount / totalCount) * 100 : 0,
    };
  }

  serialize(): string {
    const data = {
      playerState: Array.from(this.state.playerState.entries()),
      discoveredCount: this.state.discoveredCount,
      analyzedCount: this.state.analyzedCount,
      lastDiscoveredAt: this.state.lastDiscoveredAt,
    };
    return JSON.stringify(data);
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.state.playerState = new Map(parsed.playerState);
    this.state.discoveredCount = parsed.discoveredCount ?? 0;
    this.state.analyzedCount = parsed.analyzedCount ?? 0;
    this.state.lastDiscoveredAt = parsed.lastDiscoveredAt ?? null;
  }

  reset(): void {
    this.state.playerState.clear();
    this.state.discoveredCount = 0;
    this.state.analyzedCount = 0;
    this.state.lastDiscoveredAt = null;
  }

  private areDependenciesMet(observationId: string): boolean {
    const observation = this.state.observations.get(observationId);
    if (!observation) return false;

    for (const dep of observation.dependencies) {
      if (dep.dependencyType === "requires" || dep.dependencyType === "supersedes") {
        const depState = this.state.playerState.get(dep.dependsOn);
        if (!depState?.isDiscovered) {
          return false;
        }
      }
    }

    return true;
  }

  private processDeductionUnlocks(observationId: string): string[] {
    const observation = this.state.observations.get(observationId);
    if (!observation) return [];

    const unlockedDeductions: string[] = [];

    if (observation.unlocksDeductions.length > 0) {
      unlockedDeductions.push(...observation.unlocksDeductions);
    }

    for (const dep of observation.dependencies) {
      if (dep.dependencyType === "enhances") {
        const depState = this.state.playerState.get(dep.dependsOn);
        if (depState?.isDiscovered) {
          const enhancedConfidence = depState.confidenceLevel + observation.confidenceGain * 0.5;
          this.state.playerState.set(dep.dependsOn, {
            ...depState,
            confidenceLevel: enhancedConfidence,
          });
        }
      }
    }

    return unlockedDeductions;
  }

  private evaluateCondition(
    condition: ObservationCondition,
    context: Record<string, unknown>,
  ): boolean {
    const contextValue = context[condition.type];

    if (!condition.operator || condition.operator === "exists") {
      if (condition.targetId) {
        if (Array.isArray(contextValue)) {
          return contextValue.includes(condition.targetId);
        }
        if (contextValue instanceof Set) {
          return contextValue.has(condition.targetId);
        }
        return false;
      }
      return contextValue !== undefined && contextValue !== null;
    }

    const value = condition.value;

    switch (condition.operator) {
      case "equals":
        return contextValue === value;
      case "not_equals":
        return contextValue !== value;
      case "greater_than":
        return typeof contextValue === "number" && typeof value === "number"
          ? contextValue > value
          : false;
      case "less_than":
        return typeof contextValue === "number" && typeof value === "number"
          ? contextValue < value
          : false;
      case "contains":
        if (typeof contextValue === "string" && typeof value === "string") {
          return contextValue.includes(value);
        }
        if (Array.isArray(contextValue) && typeof value === "string") {
          return contextValue.includes(value);
        }
        return false;
      default:
        return false;
    }
  }
}
