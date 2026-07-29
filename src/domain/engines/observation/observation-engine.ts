import type { IObservationEngine } from "../i-observation-engine";
import type { Result } from "@/domain/results/result";
import type { EventBus } from "@/domain/events/base-event";
import type { Confidence } from "@/domain/value-objects/confidence";
import type {
  ObservationState,
  ObservationDefinition,
} from "@/types/observation";
import type {
  ObservationEntry,
  ObservationObjectDefinition,
  ObservationContext,
} from "./types";
import { success, failure } from "@/domain/results/result";
import {
  ObservationNotFoundError,
  EngineError,
} from "@/domain/errors/domain-error";
import { ObservationManager } from "./manager/observation-manager";
import { createConfidence } from "@/domain/value-objects/confidence";
import * as O from "./types";

const CONTEXT_CACHE: Map<string, ObservationContext> = new Map();

export class ObservationEngine implements IObservationEngine {
  readonly id: string;
  readonly name: string;

  private readonly _manager: ObservationManager;
  private readonly _config: O.ObservationEngineConfig;
  private _eventBus: EventBus | null = null;

  constructor(config?: Partial<O.ObservationEngineConfig>) {
    this.id = "observation-engine";
    this.name = "Observation Engine";

    this._config = { ...O.DEFAULT_OBSERVATION_ENGINE_CONFIG, ...config };
    this._manager = new ObservationManager(this._config);
  }

  get manager(): ObservationManager {
    return this._manager;
  }

  get config(): Readonly<O.ObservationEngineConfig> {
    return this._config;
  }

  setEventBus(eventBus: EventBus | null): void {
    this._eventBus = eventBus;
    this._manager.setEventBus(eventBus as unknown as { publish: (event: unknown) => Promise<void> } | null);
  }

  getEventBus(): EventBus | null {
    return this._eventBus;
  }

  private _getOrCreateContext(caseId: string, playerId: string): ObservationContext {
    const key = `${caseId}:${playerId}`;
    if (CONTEXT_CACHE.has(key)) return CONTEXT_CACHE.get(key)!;

    const ctx = this._manager.ensureContext(
      null as unknown as ObservationContext,
      caseId,
      playerId,
    );
    CONTEXT_CACHE.set(key, ctx);
    return ctx;
  }

  registerObservation(def: ObservationObjectDefinition): Result<ObservationEntry> {
    const ctx = this._getOrCreateContext(def.caseId, "default");
    return this._manager.registerObservation(ctx, def);
  }

  registerObservations(defs: ObservationObjectDefinition[]): Result<ObservationEntry[]> {
    if (defs.length === 0) return success([]);

    const firstDef = defs[0];
    if (!firstDef) return success([]);
    const ctx = this._getOrCreateContext(firstDef.caseId, "default");
    const entries: ObservationEntry[] = [];

    for (const def of defs) {
      const result = this._manager.registerObservation(ctx, def);
      if (!result.success) return result as Result<ObservationEntry[]>;
      entries.push(result.data);
    }

    return success(entries);
  }

  observe(
    caseId: string,
    observationId: string,
    locationId: string,
    playerId: string,
  ): Result<ObservationEntry> {
    const ctx = this._getOrCreateContext(caseId, playerId);
    return this._manager.observe(ctx, observationId, locationId, "manual_observe");
  }

  verify(
    caseId: string,
    observationId: string,
    playerId: string,
  ): Result<ObservationEntry> {
    const ctx = this._getOrCreateContext(caseId, playerId);
    return this._manager.verify(ctx, observationId, playerId);
  }

  reject(
    caseId: string,
    observationId: string,
    playerId: string,
    reason?: string,
  ): Result<ObservationEntry> {
    const ctx = this._getOrCreateContext(caseId, playerId);
    return this._manager.reject(ctx, observationId, reason);
  }

  unlock(
    caseId: string,
    observationId: string,
    playerId: string,
    sourceObservationId?: string,
  ): Result<ObservationEntry> {
    const ctx = this._getOrCreateContext(caseId, playerId);
    return this._manager.unlock(ctx, observationId, sourceObservationId);
  }

  lock(
    caseId: string,
    observationId: string,
    playerId: string,
    reason?: string,
  ): Result<ObservationEntry> {
    const ctx = this._getOrCreateContext(caseId, playerId);
    return this._manager.lock(ctx, observationId, reason);
  }

  hide(
    caseId: string,
    observationId: string,
    playerId: string,
    reason?: string,
  ): Result<ObservationEntry> {
    const ctx = this._getOrCreateContext(caseId, playerId);
    return this._manager.hide(ctx, observationId, reason);
  }

  show(
    caseId: string,
    observationId: string,
    playerId: string,
  ): Result<ObservationEntry> {
    const ctx = this._getOrCreateContext(caseId, playerId);
    return this._manager.unlock(ctx, observationId);
  }

  reobserve(
    caseId: string,
    observationId: string,
    playerId: string,
  ): Result<ObservationEntry> {
    const ctx = this._getOrCreateContext(caseId, playerId);
    return this._manager.reobserve(ctx, observationId);
  }

  getObservation(
    _observationId: string,
    _playerId: string,
  ): Promise<Result<ObservationState>> {
    return Promise.resolve(
      failure(new ObservationNotFoundError("Use getEntry() for domain-level observation access")),
    );
  }

  getEntry(
    caseId: string,
    observationId: string,
    playerId: string,
  ): Result<ObservationEntry> {
    const ctx = this._getOrCreateContext(caseId, playerId);
    return this._manager.getObservation(ctx, observationId);
  }

  getAll(
    caseId: string,
    playerId: string,
  ): ObservationEntry[] {
    const ctx = this._getOrCreateContext(caseId, playerId);
    return this._manager.getAll(ctx);
  }

  getByGroup(
    caseId: string,
    groupId: string,
    playerId: string,
  ): ObservationEntry[] {
    const ctx = this._getOrCreateContext(caseId, playerId);
    return this._manager.getByGroup(ctx, groupId);
  }

  getByLocation(
    caseId: string,
    locationId: string,
    playerId: string,
  ): ObservationEntry[] {
    const ctx = this._getOrCreateContext(caseId, playerId);
    return this._manager.getByLocation(ctx, locationId);
  }

  getByTag(
    caseId: string,
    tag: string,
    playerId: string,
  ): ObservationEntry[] {
    const ctx = this._getOrCreateContext(caseId, playerId);
    return this._manager.getByTag(ctx, tag);
  }

  getByState(
    caseId: string,
    state: O.ObservationLifecycleState,
    playerId: string,
  ): ObservationEntry[] {
    const ctx = this._getOrCreateContext(caseId, playerId);
    return this._manager.getByState(ctx, state);
  }

  search(
    caseId: string,
    criteria: O.ObservationSearchCriteria,
    playerId: string,
  ): ObservationEntry[] {
    const ctx = this._getOrCreateContext(caseId, playerId);
    return this._manager.search(ctx, criteria);
  }

  filter(
    caseId: string,
    criteria: O.ObservationFilterCriteria,
    playerId: string,
  ): ObservationEntry[] {
    const ctx = this._getOrCreateContext(caseId, playerId);
    return this._manager.filter(ctx, criteria);
  }

  sort(
    caseId: string,
    options: O.ObservationSortOption[],
    playerId: string,
  ): ObservationEntry[] {
    const ctx = this._getOrCreateContext(caseId, playerId);
    return this._manager.sort(ctx, options);
  }

  validate(
    caseId: string,
    playerId: string,
  ): O.ObservationValidationResult {
    const ctx = this._getOrCreateContext(caseId, playerId);
    return this._manager.validate(ctx);
  }

  registerGroup(
    caseId: string,
    group: O.ObservationGroupDefinition,
    playerId: string,
  ): void {
    const ctx = this._getOrCreateContext(caseId, playerId);
    this._manager.registerGroup(ctx, group);
  }

  reset(
    caseId: string,
    playerId: string,
  ): void {
    const ctx = this._getOrCreateContext(caseId, playerId);
    this._manager.reset(ctx);
    CONTEXT_CACHE.delete(`${caseId}:${playerId}`);
  }

  getObservations(
    caseId: string,
    playerId: string,
  ): Promise<Result<ObservationState[]>> {
    const entries = this.getAll(caseId, playerId);
    const states: ObservationState[] = entries.map(mapEntryToObservationState);
    return Promise.resolve(success(states));
  }

  getDefinition(_observationId: string): Promise<Result<ObservationDefinition>> {
    return Promise.resolve(
      failure(new ObservationNotFoundError("Use getObservationDefinition() for domain-level access")),
    );
  }

  getDefinitionsForCase(_caseId: string): Promise<Result<ObservationDefinition[]>> {
    return Promise.resolve(
      failure(new EngineError("observation-engine", "Use getAll() or getObservationDefinition() for domain-level access")),
    );
  }

  getObservationDefinition(
    caseId: string,
    observationId: string,
    playerId: string,
  ): Result<ObservationObjectDefinition> {
    const ctx = this._getOrCreateContext(caseId, playerId);
    const def = ctx.definitions.get(observationId);
    if (!def) {
      return failure(
        new ObservationNotFoundError(`Definition for '${observationId}' not found`),
      );
    }
    return success(def);
  }

  makeObservation(
    caseId: string,
    observationId: string,
    objectId: string,
    locationId: string,
    playerId: string,
  ): Promise<Result<ObservationState>> {
    const result = this.observe(caseId, observationId, locationId, playerId);
    if (!result.success) return Promise.resolve(result as Result<ObservationState>);

    return Promise.resolve(
      success(mapEntryToObservationState(result.data)),
    );
  }

  analyzeObservation(
    _observationId: string,
    _playerId: string,
    _notes: string,
  ): Promise<Result<ObservationState>> {
    return Promise.resolve(
      failure(new EngineError("observation-engine", "Use verify() for observation verification with domain-level objects")),
    );
  }

  canObserve(
    caseId: string,
    observationId: string,
    playerId: string,
  ): Promise<Result<boolean>> {
    const ctx = this._getOrCreateContext(caseId, playerId);
    const entry = ctx.entries.get(observationId);
    const canObserve =
      entry?.lifecycleState === "available" || entry?.lifecycleState === "inspecting";
    return Promise.resolve(success(canObserve));
  }

  getObservableObjects(
    caseId: string,
    locationId: string,
    playerId: string,
  ): Promise<Result<ObservationDefinition[]>> {
    const ctx = this._getOrCreateContext(caseId, playerId);
    const defs: ObservationDefinition[] = [];
    for (const [, def] of ctx.definitions) {
      if (def.locationId === locationId) {
        const entry = ctx.entries.get(def.id);
        if (entry?.lifecycleState !== "hidden" && entry?.lifecycleState !== "archived") {
          defs.push(mapDefToObservationDefinition(def));
        }
      }
    }
    return Promise.resolve(success(defs));
  }

  getUndiscoveredObservations(
    caseId: string,
    playerId: string,
  ): Promise<Result<ObservationDefinition[]>> {
    const ctx = this._getOrCreateContext(caseId, playerId);
    const defs: ObservationDefinition[] = [];
    for (const [, def] of ctx.definitions) {
      const entry = ctx.entries.get(def.id);
      if (!entry || entry.lifecycleState === "hidden") {
        defs.push(mapDefToObservationDefinition(def));
      }
    }
    return Promise.resolve(success(defs));
  }

  getCriticalObservations(
    caseId: string,
    playerId: string,
  ): Promise<Result<ObservationDefinition[]>> {
    const ctx = this._getOrCreateContext(caseId, playerId);
    const defs: ObservationDefinition[] = [];
    for (const [, def] of ctx.definitions) {
      if (def.isCritical) {
        defs.push(mapDefToObservationDefinition(def));
      }
    }
    return Promise.resolve(success(defs));
  }

  getObservationConfidence(
    observationId: string,
    _playerId: string,
  ): Promise<Result<Confidence>> {
    const record = this._manager.confidenceManager.getConfidence(observationId);
    if (!record) {
      return Promise.resolve(
        failure(new ObservationNotFoundError(`Confidence for '${observationId}' not found`)),
      );
    }
    return Promise.resolve(success(createConfidence(record.value)));
  }

  validateObservationConditions(
    caseId: string,
    observationId: string,
    playerId: string,
  ): Promise<Result<boolean>> {
    const ctx = this._getOrCreateContext(caseId, playerId);
    const entry = ctx.entries.get(observationId);
    if (!entry) {
      return Promise.resolve(success(false));
    }
    const depSatisfied = this._manager.dependencyGraph.areDependenciesSatisfied(observationId);
    return Promise.resolve(success(depSatisfied));
  }

  getContext(caseId: string, playerId: string): ObservationContext {
    return this._getOrCreateContext(caseId, playerId);
  }

  clearCache(): void {
    CONTEXT_CACHE.clear();
  }
}

function mapEntryToObservationState(entry: ObservationEntry): ObservationState {
  return {
    observationId: entry.id,
    isDiscovered: entry.lifecycleState !== "hidden",
    discoveredAt: entry.discoveredAt?.iso ?? null,
    isAnalyzed: entry.lifecycleState === "verified",
    analyzedAt: entry.verifiedAt?.iso ?? null,
    playerNotes: entry.playerNotes,
    confidenceLevel: entry.confidence.value,
    isPinned: entry.isPinned,
  };
}

function mapDefToObservationDefinition(def: ObservationObjectDefinition): ObservationDefinition {
  return {
    id: def.id,
    caseId: def.caseId,
    objectId: def.sourceObjectId,
    category: def.category as ObservationDefinition["category"],
    title: def.title,
    description: def.description,
    detailedDescription: def.detailedDescription,
    visibility: def.visibility as ObservationDefinition["visibility"],
    conditions: def.requirements.requirements.map((r) => ({
      type: r.type as ObservationDefinition["conditions"][0]["type"],
      targetId: r.targetId,
      value: r.value,
      operator: r.operator as ObservationDefinition["conditions"][0]["operator"],
    })),
    dependencies: def.dependencyDefs.map((d) => ({
      dependsOn: d.dependsOnId,
      dependencyType: d.dependencyType as "requires" | "enhances" | "contradicts" | "supersedes",
      description: d.description,
    })),
    confidenceGain: def.confidenceGain,
    unlocksDeductions: def.unlocksObservations,
    tags: def.tags,
    order: def.order,
    isCritical: def.isCritical,
    xpReward: def.xpReward,
  };
}
