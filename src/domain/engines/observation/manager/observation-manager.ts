import type {
  ObservationObjectDefinition,
  ObservationEntry,
  ObservationContext,
  ObservationLifecycleState,
  ObservationLifecycleSnapshot,
  ObservationGroupDefinition,
  ObservationDependencyDefinition,
  ObservationFilterCriteria,
  ObservationSearchCriteria,
  ObservationSortOption,
  ObservationValidationResult,
  ObservationDiscoveryEntry,
  ObservationEngineConfig,
} from "../types";
import type { Result } from "@/domain/results/result";
import type { DomainTimestamp } from "@/domain/value-objects/timestamp";
import { success, failure, tryCatch } from "@/domain/results/result";
import {
  ObservationNotFoundError,
  ObservationAlreadyMadeError,
  RequirementNotMetError,
  ValidationError,
  EngineError,
} from "@/domain/errors/domain-error";
import { ObservationLifecycle } from "../lifecycle/observation-lifecycle";
import { isObservableState, isPositiveOutcome } from "../lifecycle/observation-lifecycle-states";
import { createObservationContext, touchContext } from "../context/observation-context";
import { ObservationCache } from "../cache/observation-cache";
import { GroupManager } from "../groups/group-manager";
import { ConfidenceManager } from "../confidence/confidence-manager";
import { DiscoveryTracker } from "../discovery/discovery-tracker";
import { DependencyGraph } from "../dependencies/dependency-graph";
import { ObservationSearch } from "../search/observation-search";
import { ObservationFilter } from "../filter/observation-filter";
import { ObservationSort } from "../sort/observation-sort";
import { ObservationValidator } from "../validation/observation-validator";
import { InMemoryObservationRepository } from "../repository/observation-repository";
import { buildRequirementContext, evaluateRequirements } from "../requirements/requirement-evaluator";
import { generateUuid } from "@/domain/utils/id-generator";
import { now } from "@/domain/value-objects/timestamp";
import * as O from "../types";

export class ObservationManager {
  readonly id: string;
  readonly name: string;

  private readonly _cache: ObservationCache;
  private readonly _groupManager: GroupManager;
  private readonly _confidenceManager: ConfidenceManager;
  private readonly _discoveryTracker: DiscoveryTracker;
  private readonly _dependencyGraph: DependencyGraph;
  private readonly _searchEngine: ObservationSearch;
  private readonly _filterEngine: ObservationFilter;
  private readonly _sortEngine: ObservationSort;
  private readonly _validator: ObservationValidator;
  private readonly _repository: InMemoryObservationRepository;
  private readonly _config: O.ObservationEngineConfig;

  private _eventBus: {
    publish: (event: unknown) => Promise<void>;
  } | null = null;

  constructor(config?: Partial<O.ObservationEngineConfig>) {
    this.id = "observation-manager";
    this.name = "Observation Manager";

    this._config = { ...O.DEFAULT_OBSERVATION_ENGINE_CONFIG, ...config };

    this._cache = new ObservationCache();
    this._groupManager = new GroupManager();
    this._confidenceManager = new ConfidenceManager();
    this._discoveryTracker = new DiscoveryTracker(this._config.maxDiscoveryHistory);
    this._dependencyGraph = new DependencyGraph();
    this._searchEngine = new ObservationSearch();
    this._filterEngine = new ObservationFilter();
    this._sortEngine = new ObservationSort();
    this._validator = new ObservationValidator();
    this._repository = new InMemoryObservationRepository();
  }

  get config(): Readonly<O.ObservationEngineConfig> {
    return this._config;
  }

  get cache(): ObservationCache {
    return this._cache;
  }

  get groupManager(): GroupManager {
    return this._groupManager;
  }

  get confidenceManager(): ConfidenceManager {
    return this._confidenceManager;
  }

  get discoveryTracker(): DiscoveryTracker {
    return this._discoveryTracker;
  }

  get dependencyGraph(): DependencyGraph {
    return this._dependencyGraph;
  }

  get validator(): ObservationValidator {
    return this._validator;
  }

  setEventBus(
    bus: { publish: (event: unknown) => Promise<void> } | null,
  ): void {
    this._eventBus = bus;
  }

  ensureContext(ctx: ObservationContext, caseId: string, playerId: string): ObservationContext {
    if (ctx) return ctx;

    const existing = this._repository.getContext(caseId, playerId);
    if (existing) return existing;

    return createObservationContext(generateUuid(), caseId, playerId);
  }

  registerObservation(
    ctx: ObservationContext,
    definition: ObservationObjectDefinition,
  ): Result<ObservationEntry> {
    if (this._config.validateOnRegister) {
      const validation = this._validator.validateDefinition(definition);
      if (!validation.isValid) {
        return failure(
          new ValidationError(
            `Invalid observation definition '${definition.id}': ${validation.errors.map((e) => e.message).join("; ")}`,
          ),
        );
      }
    }

    if (ctx.entries.has(definition.id)) {
      return success(ctx.entries.get(definition.id)!);
    }

    const allDefIds = new Set([
      ...Array.from(ctx.definitions.keys()),
      definition.id,
    ]);

    for (const dep of definition.dependencyDefs) {
      const depValidation = this._validator.validateDependency(dep, allDefIds);
      if (!depValidation.isValid && this._config.strictValidation) {
        return failure(
          new ValidationError(
            `Invalid dependency in '${definition.id}': ${depValidation.errors.map((e) => e.message).join("; ")}`,
          ),
        );
      }
    }

    this._repository.saveDefinition(ctx, definition);

    const groupIds = this._groupManager
      .getAllGroups()
      .filter((g) => g.observationIds.includes(definition.id))
      .map((g) => g.id);

    const entry = this._repository.createEntry(
      definition,
      definition.dependencyDefs,
      groupIds,
    );

    this._repository.saveEntry(ctx, entry);

    if (this._config.enableConfidenceTracking) {
      this._confidenceManager.initialize(definition.id);
    }

    if (this._config.enableDependencyGraph) {
      this._dependencyGraph.addNode(definition.id, definition.dependencyDefs);
    }

    if (definition.isHidden && definition.hiddenRequirements) {
      const reqCtx = buildRequirementContext(ctx);
      const reqResult = evaluateRequirements(
        definition.hiddenRequirements.requirements,
        definition.hiddenRequirements.sets,
        definition.hiddenRequirements.requiredCount,
        definition.hiddenRequirements.combinator,
        reqCtx,
      );

      if (reqResult.isSatisfied) {
        this._transitionEntry(ctx, entry, "available", "registerObservation", "Hidden requirements satisfied");
      }
    }

    touchContext(ctx);

    return success(entry);
  }

  observe(
    ctx: ObservationContext,
    observationId: string,
    locationId: string,
    playerAction: string,
  ): Result<ObservationEntry> {
    const entryResult = this._repository.getEntry(ctx, observationId);
    if (!entryResult.success) return entryResult;

    const entry = entryResult.data;

    if (!isObservableState(entry.lifecycleState)) {
      return failure(
        new RequirementNotMetError(
          "Observation",
          observationId,
          `not observable (current state: ${entry.lifecycleState})`,
        ),
      );
    }

    const lifecycle = new ObservationLifecycle();
    lifecycle.attach(entry);

    if (entry.lifecycleState === "available") {
      this._transitionEntry(ctx, entry, "inspecting", "observe", `Player action: ${playerAction}`);
      lifecycle.transition("inspecting", "observe");
    }

    this._transitionEntry(
      ctx,
      ctx.entries.get(observationId)!,
      "observed",
      "observe",
      `Player action: ${playerAction} at ${locationId}`,
    );

    const newEntry = ctx.entries.get(observationId)!;
    const updatedWithTimestamp = {
      ...newEntry,
      observedAt: now(),
      observationCount: newEntry.observationCount + 1,
      updatedAt: now(),
    };
    this._repository.saveEntry(ctx, updatedWithTimestamp);

    if (this._config.enableConfidenceTracking) {
      this._confidenceManager.updateConfidence(
        observationId,
        entry.definition.confidenceGain,
        "observation",
        "Observation completed",
      );
    }

    if (this._config.enableDependencyGraph) {
      this._dependencyGraph.markSatisfied(observationId);
    }

    if (this._config.enableGroupManagement) {
      for (const gid of entry.groupIds) {
        this._groupManager.updateObservationState(gid, observationId, "observed");
      }
    }

    this._discoveryTracker.record(
      observationId,
      locationId,
      playerAction,
      "ObservationManager.observe",
      entry.lifecycleState,
      "observed",
    );

    this._notifyObservationCompleted(ctx, updatedWithTimestamp);

    this._evaluateUnlocks(ctx, observationId);

    touchContext(ctx);
    return success(ctx.entries.get(observationId)!);
  }

  verify(
    ctx: ObservationContext,
    observationId: string,
    _playerId: string,
  ): Result<ObservationEntry> {
    const entryResult = this._repository.getEntry(ctx, observationId);
    if (!entryResult.success) return entryResult;

    const entry = entryResult.data;

    if (!isPositiveOutcome(entry.lifecycleState)) {
      return failure(
        new RequirementNotMetError(
          "Observation",
          observationId,
          `cannot be verified (current state: ${entry.lifecycleState})`,
        ),
      );
    }

    const updatedEntry = this._transitionEntry(
      ctx,
      entry,
      "verified",
      "verify",
      "Verified by player",
    );

    const newEntry: ObservationEntry = {
      ...updatedEntry,
      verifiedAt: now(),
      updatedAt: now(),
    };
    this._repository.saveEntry(ctx, newEntry);

    if (this._config.enableConfidenceTracking) {
      this._confidenceManager.setConfidence(observationId, 1.0, "verification", "Observation verified");
    }

    this._notifyObservationVerified(ctx, newEntry);

    touchContext(ctx);
    return success(newEntry);
  }

  reject(
    ctx: ObservationContext,
    observationId: string,
    reason?: string,
  ): Result<ObservationEntry> {
    const entryResult = this._repository.getEntry(ctx, observationId);
    if (!entryResult.success) return entryResult;

    const entry = entryResult.data;

    const updatedEntry = this._transitionEntry(
      ctx,
      entry,
      "rejected",
      "reject",
      reason ?? "Rejected",
    );

    const newEntry: ObservationEntry = {
      ...updatedEntry,
      rejectedAt: now(),
      updatedAt: now(),
    };
    this._repository.saveEntry(ctx, newEntry);

    if (this._config.enableConfidenceTracking) {
      this._confidenceManager.updateConfidence(
        observationId,
        -0.3,
        "rejection",
        reason ?? "Observation rejected",
      );
    }

    this._notifyObservationRejected(ctx, newEntry, reason);

    touchContext(ctx);
    return success(newEntry);
  }

  unlock(
    ctx: ObservationContext,
    observationId: string,
    sourceObservationId?: string,
  ): Result<ObservationEntry> {
    const entryResult = this._repository.getEntry(ctx, observationId);
    if (!entryResult.success) return entryResult;

    const entry = entryResult.data;

    if (entry.lifecycleState !== "hidden" && entry.lifecycleState !== "locked") {
      return success(entry);
    }

    const updatedEntry = this._transitionEntry(
      ctx,
      entry,
      "available",
      "unlock",
      sourceObservationId
        ? `Unlocked by observing '${sourceObservationId}'`
        : "Unlocked",
    );

    const newEntry: ObservationEntry = {
      ...updatedEntry,
      discoveredAt: entry.discoveredAt ?? now(),
      updatedAt: now(),
    };
    this._repository.saveEntry(ctx, newEntry);

    this._discoveryTracker.record(
      observationId,
      entry.definition.locationId,
      "unlock",
      "ObservationManager.unlock",
      entry.lifecycleState,
      "available",
      { sourceObservationId },
    );

    this._notifyObservationUnlocked(ctx, newEntry, sourceObservationId);

    touchContext(ctx);
    return success(newEntry);
  }

  lock(
    ctx: ObservationContext,
    observationId: string,
    reason?: string,
  ): Result<ObservationEntry> {
    const entryResult = this._repository.getEntry(ctx, observationId);
    if (!entryResult.success) return entryResult;

    const entry = entryResult.data;

    const updatedEntry = this._transitionEntry(
      ctx,
      entry,
      "locked",
      "lock",
      reason ?? "Locked",
    );

    const newEntry: ObservationEntry = {
      ...updatedEntry,
      lockedAt: now(),
      updatedAt: now(),
    };
    this._repository.saveEntry(ctx, newEntry);

    if (this._config.enableDependencyGraph) {
      this._dependencyGraph.markUnsatisfied(observationId);
    }

    this._notifyObservationLocked(ctx, newEntry, reason);

    touchContext(ctx);
    return success(newEntry);
  }

  hide(
    ctx: ObservationContext,
    observationId: string,
    reason?: string,
  ): Result<ObservationEntry> {
    const entryResult = this._repository.getEntry(ctx, observationId);
    if (!entryResult.success) return entryResult;

    const entry = entryResult.data;

    const updatedEntry = this._transitionEntry(
      ctx,
      entry,
      "hidden",
      "hide",
      reason ?? "Hidden",
    );
    this._repository.saveEntry(ctx, updatedEntry);

    this._notifyObservationHidden(ctx, updatedEntry, reason);

    touchContext(ctx);
    return success(updatedEntry);
  }

  reobserve(
    ctx: ObservationContext,
    observationId: string,
  ): Result<ObservationEntry> {
    if (!this._config.allowReobservation) {
      return failure(
        new EngineError("observation-engine", "Reobservation is disabled in engine configuration"),
      );
    }

    const entryResult = this._repository.getEntry(ctx, observationId);
    if (!entryResult.success) return entryResult;

    const entry = entryResult.data;

    const updatedEntry = this._transitionEntry(
      ctx,
      entry,
      "available",
      "reobserve",
      "Reset for reobservation",
    );

    const newEntry: ObservationEntry = {
      ...updatedEntry,
      observedAt: null,
      verifiedAt: null,
      rejectedAt: null,
      updatedAt: now(),
    };
    this._repository.saveEntry(ctx, newEntry);

    if (this._config.enableConfidenceTracking) {
      this._confidenceManager.degradeConfidence(observationId, 0.8, "reobservation");
    }

    touchContext(ctx);
    return success(newEntry);
  }

  getObservation(
    ctx: ObservationContext,
    observationId: string,
  ): Result<ObservationEntry> {
    return this._repository.getEntry(ctx, observationId);
  }

  getAll(ctx: ObservationContext): ObservationEntry[] {
    return this._repository.getAllEntries(ctx);
  }

  getByGroup(ctx: ObservationContext, groupId: string): ObservationEntry[] {
    const group = this._groupManager.getGroup(groupId);
    if (!group) return [];

    return group.observationIds
      .map((id) => ctx.entries.get(id))
      .filter((e): e is ObservationEntry => e !== undefined);
  }

  getByLocation(ctx: ObservationContext, locationId: string): ObservationEntry[] {
    return this._cache.getByLocation(locationId);
  }

  getByTag(ctx: ObservationContext, tag: string): ObservationEntry[] {
    return this._cache.getByTag(tag);
  }

  getByState(ctx: ObservationContext, state: ObservationLifecycleState): ObservationEntry[] {
    return this._cache.getByState(state);
  }

  search(
    ctx: ObservationContext,
    criteria: ObservationSearchCriteria,
  ): ObservationEntry[] {
    const all = this.getAll(ctx);
    return this._searchEngine.search(all, criteria);
  }

  filter(
    ctx: ObservationContext,
    criteria: ObservationFilterCriteria,
  ): ObservationEntry[] {
    const all = this.getAll(ctx);
    return this._filterEngine.filter(all, criteria);
  }

  sort(
    ctx: ObservationContext,
    options: ObservationSortOption[],
  ): ObservationEntry[] {
    const all = this.getAll(ctx);
    return this._sortEngine.sort(all, options);
  }

  validate(ctx: ObservationContext): ObservationValidationResult {
    return this._validator.validateAll(ctx);
  }

  registerGroup(
    ctx: ObservationContext,
    group: ObservationGroupDefinition,
  ): void {
    this._groupManager.registerGroup(group);
    this._groupManager.syncToContext(ctx);
  }

  registerGroups(
    ctx: ObservationContext,
    groups: ObservationGroupDefinition[],
  ): void {
    for (const group of groups) {
      this._groupManager.registerGroup(group);
    }
    this._groupManager.syncToContext(ctx);
  }

  getGroupState(groupId: string) {
    return this._groupManager.getGroupState(groupId);
  }

  getAllGroups() {
    return this._groupManager.getAllGroups();
  }

  reset(ctx: ObservationContext): void {
    this._cache.clear();
    this._groupManager.clear();
    this._confidenceManager.clear();
    this._discoveryTracker.clear();
    this._dependencyGraph.clear();

    ctx.entries.clear();
    ctx.groups.clear();
    ctx.groupStates.clear();
    ctx.dependencyNodes.clear();
    ctx.confidenceRecords.clear();
    ctx.discoveryHistory = [];
    ctx.lifecycleState = "hidden";
    ctx.lifecycleHistory = [];
    ctx.runtimeVariables.clear();
    ctx.playerFlags.clear();
    ctx.temporaryCache.clear();

    touchContext(ctx);
  }

  syncAllToContext(ctx: ObservationContext): void {
    this._cache.syncToContext(ctx);
    this._groupManager.syncToContext(ctx);
    this._confidenceManager.syncToContext(ctx);
    this._discoveryTracker.syncToContext(ctx);
    this._dependencyGraph.syncToContext(ctx);
    touchContext(ctx);
  }

  syncAllFromContext(ctx: ObservationContext): void {
    this._cache.syncFromContext(ctx);
    this._groupManager.syncFromContext(ctx);
    this._confidenceManager.syncFromContext(ctx);
    this._discoveryTracker.syncFromContext(ctx);
    this._dependencyGraph.syncFromContext(ctx);
  }

  private _transitionEntry(
    ctx: ObservationContext,
    entry: ObservationEntry,
    to: ObservationLifecycleState,
    source: string,
    reason?: string,
  ): ObservationEntry {
    const previousState = entry.lifecycleState;
    const timestamp = now();

    const snapshot: ObservationLifecycleSnapshot = {
      state: to,
      previousState,
      timestamp,
      source,
      metadata: reason ? { reason } : undefined,
    };

    const updated: ObservationEntry = {
      ...entry,
      lifecycleState: to,
      lifecycleHistory: [...entry.lifecycleHistory, snapshot],
      updatedAt: timestamp,
    };

    ctx.entries.set(entry.id, updated);
    this._cache.set(entry.id, updated);
    this._cache.updateState(entry.id, to);

    ctx.lifecycleHistory.push(snapshot);

    return updated;
  }

  private _evaluateUnlocks(ctx: ObservationContext, completedId: string): void {
    for (const [, def] of ctx.definitions) {
      if (def.unlocksObservations.includes(completedId)) {
        this.unlock(ctx, def.id, completedId);
      }
    }

    for (const [, def] of ctx.definitions) {
      const entry = ctx.entries.get(def.id);
      if (entry && entry.lifecycleState === "hidden" && this._config.enableConfidenceTracking) {
        const reqCtx = buildRequirementContext(ctx);
        const reqResult = evaluateRequirements(
          def.hiddenRequirements?.requirements ?? [],
          def.hiddenRequirements?.sets ?? [],
          def.hiddenRequirements?.requiredCount ?? 0,
          def.hiddenRequirements?.combinator ?? "all",
          reqCtx,
        );

        if (reqResult.isSatisfied) {
          this.unlock(ctx, def.id, completedId);
        }
      }
    }
  }

  private async _notifyObservationCompleted(
    ctx: ObservationContext,
    entry: ObservationEntry,
  ): Promise<void> {
    if (!this._config.enableEventSystem || !this._eventBus) return;

    await this._eventBus.publish({
      id: generateUuid(),
      type: "OBSERVATION_COMPLETED",
      timestamp: now(),
      source: "ObservationManager",
      caseId: ctx.caseId,
      observationId: entry.id,
      objectId: entry.definition.sourceObjectId,
      locationId: entry.definition.locationId,
      playerId: ctx.playerId,
      confidenceGain: entry.definition.confidenceGain,
      newState: entry.lifecycleState,
    }).catch(() => {});
  }

  private async _notifyObservationVerified(
    ctx: ObservationContext,
    entry: ObservationEntry,
  ): Promise<void> {
    if (!this._config.enableEventSystem || !this._eventBus) return;

    await this._eventBus.publish({
      id: generateUuid(),
      type: "OBSERVATION_VERIFIED",
      timestamp: now(),
      source: "ObservationManager",
      caseId: ctx.caseId,
      observationId: entry.id,
      playerId: ctx.playerId,
      confidence: entry.confidence.value,
    }).catch(() => {});
  }

  private async _notifyObservationRejected(
    ctx: ObservationContext,
    entry: ObservationEntry,
    reason?: string,
  ): Promise<void> {
    if (!this._config.enableEventSystem || !this._eventBus) return;

    await this._eventBus.publish({
      id: generateUuid(),
      type: "OBSERVATION_REJECTED",
      timestamp: now(),
      source: "ObservationManager",
      caseId: ctx.caseId,
      observationId: entry.id,
      playerId: ctx.playerId,
      reason,
    }).catch(() => {});
  }

  private async _notifyObservationUnlocked(
    ctx: ObservationContext,
    entry: ObservationEntry,
    sourceObservationId?: string,
  ): Promise<void> {
    if (!this._config.enableEventSystem || !this._eventBus) return;

    await this._eventBus.publish({
      id: generateUuid(),
      type: "OBSERVATION_UNLOCKED",
      timestamp: now(),
      source: "ObservationManager",
      caseId: ctx.caseId,
      observationId: entry.id,
      playerId: ctx.playerId,
      sourceObservationId,
    }).catch(() => {});
  }

  private async _notifyObservationLocked(
    ctx: ObservationContext,
    entry: ObservationEntry,
    reason?: string,
  ): Promise<void> {
    if (!this._config.enableEventSystem || !this._eventBus) return;

    await this._eventBus.publish({
      id: generateUuid(),
      type: "OBSERVATION_LOCKED",
      timestamp: now(),
      source: "ObservationManager",
      caseId: ctx.caseId,
      observationId: entry.id,
      playerId: ctx.playerId,
      reason,
    }).catch(() => {});
  }

  private async _notifyObservationHidden(
    ctx: ObservationContext,
    entry: ObservationEntry,
    reason?: string,
  ): Promise<void> {
    if (!this._config.enableEventSystem || !this._eventBus) return;

    await this._eventBus.publish({
      id: generateUuid(),
      type: "OBSERVATION_HIDDEN",
      timestamp: now(),
      source: "ObservationManager",
      caseId: ctx.caseId,
      observationId: entry.id,
      playerId: ctx.playerId,
      reason,
    }).catch(() => {});
  }
}
