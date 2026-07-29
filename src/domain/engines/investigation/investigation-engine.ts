import type { IInvestigationEngine } from "../i-investigation-engine";
import type { Result } from "@/domain/results/result";
import type { EventBus } from "@/domain/events/base-event";
import type { InvestigatablePlugin } from "./types";
import type { DiscoveryEntry } from "./types";

import { InvestigationState } from "@/domain/enums";
import { success, failure } from "@/domain/results/result";
import { InvalidProgressError } from "@/domain/errors/domain-error";
import { InvestigationLifecycle } from "./lifecycle/investigation-lifecycle";
import { InvestigationFlowManager } from "./flow/investigation-flow-manager";
import { DiscoveryManager } from "./discovery/discovery-manager";
import { ActivityTracker } from "./activity/activity-tracker";
import { ProgressTracker } from "./progress/progress-tracker";
import { UnlockCoordinator } from "./unlock/unlock-coordinator";
import { NotificationCoordinator } from "./notification/notification-coordinator";
import { InvestigationSearch } from "./search/investigation-search";
import { InvestigationFilter } from "./filter/investigation-filter";
import type { UnlockableSystem } from "./unlock/unlock-coordinator";
import type {
  InvestigationContext,
  InvestigationLifecycleState,
  ProgressWeightConfig,
} from "./types";
import { now } from "@/domain/value-objects/timestamp";

const LIFECYCLE_TO_STATE: Record<InvestigationLifecycleState, string> = {
  not_started: InvestigationState.IDLE,
  preparing: InvestigationState.IDLE,
  exploring: InvestigationState.EXPLORING,
  inspecting: InvestigationState.OBSERVING,
  interrogating: InvestigationState.INTERROGATING,
  analyzing: InvestigationState.REASONING,
  reviewing: InvestigationState.REASONING,
  paused: InvestigationState.PAUSED,
  completed: InvestigationState.CONCLUDED,
  failed: InvestigationState.CONCLUDED,
  abandoned: InvestigationState.CONCLUDED,
};

export interface InvestigationEngineConfig {
  enableAutoProgress: boolean;
  enableNotifications: boolean;
  enableActivityTracking: boolean;
  enableDiscoveryTracking: boolean;
  enableSearch: boolean;
  enableFilters: boolean;
  enableUnlocks: boolean;
  enableEventSystem: boolean;
  maxRecentActions: number;
  progressWeights?: Partial<ProgressWeightConfig>;
}

const DEFAULT_CONFIG: InvestigationEngineConfig = {
  enableAutoProgress: true,
  enableNotifications: true,
  enableActivityTracking: true,
  enableDiscoveryTracking: true,
  enableSearch: true,
  enableFilters: true,
  enableUnlocks: true,
  enableEventSystem: true,
  maxRecentActions: 20,
};

export class InvestigationEngine implements IInvestigationEngine {
  readonly id: string;
  readonly name: string;

  private readonly _lifecycle: InvestigationLifecycle;
  private readonly _flowManager: InvestigationFlowManager;
  private readonly _discoveryManager: DiscoveryManager;
  private readonly _activityTracker: ActivityTracker;
  private readonly _progressTracker: ProgressTracker;
  private readonly _unlockCoordinator: UnlockCoordinator;
  private readonly _notificationCoordinator: NotificationCoordinator;
  private readonly _searchEngine: InvestigationSearch;
  private readonly _filterEngine: InvestigationFilter;
  private readonly _config: InvestigationEngineConfig;

  private _eventBus: EventBus | null = null;

  constructor(config?: Partial<InvestigationEngineConfig>) {
    this.id = "investigation-engine";
    this.name = "Investigation Engine";

    this._config = { ...DEFAULT_CONFIG, ...config };

    this._lifecycle = new InvestigationLifecycle();
    this._flowManager = new InvestigationFlowManager(this._lifecycle);
    this._discoveryManager = new DiscoveryManager();
    this._activityTracker = new ActivityTracker();
    this._progressTracker = new ProgressTracker(this._config.progressWeights);
    this._unlockCoordinator = new UnlockCoordinator();
    this._notificationCoordinator = new NotificationCoordinator();
    this._searchEngine = new InvestigationSearch();
    this._filterEngine = new InvestigationFilter();
  }

  get config(): Readonly<InvestigationEngineConfig> {
    return this._config;
  }

  get lifecycle(): InvestigationLifecycle {
    return this._lifecycle;
  }

  get flowManager(): InvestigationFlowManager {
    return this._flowManager;
  }

  get discoveryManager(): DiscoveryManager {
    return this._discoveryManager;
  }

  get activityTracker(): ActivityTracker {
    return this._activityTracker;
  }

  get progressTracker(): ProgressTracker {
    return this._progressTracker;
  }

  get unlockCoordinator(): UnlockCoordinator {
    return this._unlockCoordinator;
  }

  get notificationCoordinator(): NotificationCoordinator {
    return this._notificationCoordinator;
  }

  get searchEngine(): InvestigationSearch {
    return this._searchEngine;
  }

  get filterEngine(): InvestigationFilter {
    return this._filterEngine;
  }

  setEventBus(eventBus: EventBus): void {
    this._eventBus = eventBus;
    this._flowManager.setEventBus(eventBus);
    this._notificationCoordinator.setEventBus(eventBus);
  }

  getEventBus(): EventBus | null {
    return this._eventBus;
  }

  registerPlugin(plugin: InvestigatablePlugin): void {
    this._flowManager.registerPlugin(plugin);
  }

  unregisterPlugin(pluginId: string): boolean {
    return this._flowManager.unregisterPlugin(pluginId);
  }

  registerUnlockSystem(system: UnlockableSystem): Result<void> {
    return this._unlockCoordinator.registerSystem(system);
  }

  async startInvestigation(
    caseId: string,
    playerId: string,
  ): Promise<Result<InvestigationContext>> {
    return this._flowManager.start(caseId, playerId);
  }

  pauseInvestigation(playerId: string): Result<InvestigationContext> {
    return this._flowManager.pause(playerId);
  }

  resumeInvestigation(playerId: string): Result<InvestigationContext> {
    return this._flowManager.resume(playerId);
  }

  async restartInvestigation(
    caseId: string,
    playerId: string,
  ): Promise<Result<InvestigationContext>> {
    return this._flowManager.restart(caseId, playerId);
  }

  cancelInvestigation(playerId: string): Result<InvestigationContext> {
    return this._flowManager.cancel(playerId);
  }

  completeInvestigation(playerId: string): Result<InvestigationContext> {
    return this._flowManager.complete(playerId);
  }

  getContext(playerId: string): Result<InvestigationContext> {
    return this._flowManager.getContext(playerId);
  }

  isInvestigationActive(playerId: string): boolean {
    return this._flowManager.isActive(playerId);
  }

  moveToLocation(playerId: string, locationId: string): Result<InvestigationContext> {
    const result = this._flowManager.setCurrentLocation(playerId, locationId);
    if (result.success && this._config.enableActivityTracking) {
      this._activityTracker.trackAction(result.data, "move_to_location", {
        targetId: locationId,
        locationId,
      });
    }
    return result;
  }

  collectEvidence(
    playerId: string,
    evidenceId: string,
    options?: { locationId?: string; tags?: string[]; metadata?: Record<string, unknown> },
  ): Result<DiscoveryEntry> {
    const ctxResult = this._flowManager.getContext(playerId);
    if (!ctxResult.success) return failure(ctxResult.error);

    const ctx = ctxResult.data;
    const entry: DiscoveryEntry = {
      id: evidenceId,
      type: "evidence",
      name: (options?.metadata?.["name"] as string) ?? evidenceId,
      description: (options?.metadata?.["description"] as string) ?? "",
      locationId: options?.locationId ?? ctx.currentLocationId,
      discoveredAt: now(),
      isHidden: false,
      isKey: options?.tags?.includes("key") ?? false,
      tags: options?.tags ?? [],
      metadata: options?.metadata ?? {},
    };

    const result = this._discoveryManager.discover(
      ctx,
      entry,
      this._config.enableEventSystem && this._eventBus
        ? {
            publish: (event: unknown) =>
              this._eventBus!.publish(event as Parameters<EventBus["publish"]>[0]),
          }
        : undefined,
    );

    if (result.success && this._config.enableActivityTracking) {
      this._activityTracker.trackAction(ctx, "collect_evidence", {
        targetId: evidenceId,
        locationId: entry.locationId,
        metadata: { entry, ...options?.metadata },
      });

      if (this._config.enableNotifications) {
        this._notificationCoordinator.notifyDiscovery(ctx, entry.name);
      }
    }

    if (result.success && this._config.enableAutoProgress) {
      this._progressTracker.calculate(ctx);
    }

    return result;
  }

  makeObservation(
    playerId: string,
    observationId: string,
    options?: { locationId?: string; tags?: string[]; metadata?: Record<string, unknown> },
  ): Result<DiscoveryEntry> {
    const ctxResult = this._flowManager.getContext(playerId);
    if (!ctxResult.success) return failure(ctxResult.error);

    const ctx = ctxResult.data;
    const entry: DiscoveryEntry = {
      id: observationId,
      type: "observation",
      name: (options?.metadata?.["name"] as string) ?? observationId,
      description: (options?.metadata?.["description"] as string) ?? "",
      locationId: options?.locationId ?? ctx.currentLocationId,
      discoveredAt: now(),
      isHidden: false,
      isKey: options?.tags?.includes("key") ?? false,
      tags: options?.tags ?? [],
      metadata: options?.metadata ?? {},
    };

    const result = this._discoveryManager.discover(
      ctx,
      entry,
      this._config.enableEventSystem && this._eventBus
        ? {
            publish: (event: unknown) =>
              this._eventBus!.publish(event as Parameters<EventBus["publish"]>[0]),
          }
        : undefined,
    );

    if (result.success && this._config.enableActivityTracking) {
      this._activityTracker.trackAction(ctx, "make_observation", {
        targetId: observationId,
        locationId: entry.locationId,
        metadata: { entry, ...options?.metadata },
      });

      if (this._config.enableNotifications) {
        this._notificationCoordinator.notifyDiscovery(ctx, entry.name);
      }
    }

    if (result.success && this._config.enableAutoProgress) {
      this._progressTracker.calculate(ctx);
    }

    return result;
  }

  interrogateNPC(
    playerId: string,
    npcId: string,
    options?: { locationId?: string; metadata?: Record<string, unknown> },
  ): Result<InvestigationContext> {
    const ctxResult = this._flowManager.getContext(playerId);
    if (!ctxResult.success) return failure(ctxResult.error);

    const ctx = ctxResult.data;
    ctx.selectedNpcId = npcId;

    if (this._config.enableActivityTracking) {
      this._activityTracker.trackAction(ctx, "interrogate_suspect", {
        targetId: npcId,
        locationId: options?.locationId ?? ctx.currentLocationId,
        metadata: options?.metadata ?? {},
      });
    }

    if (this._config.enableNotifications) {
      this._notificationCoordinator.notifyDialogue(ctx, npcId);
    }

    return success(ctx);
  }

  completeObjective(playerId: string, objectiveId: string): Result<InvestigationContext> {
    const ctxResult = this._flowManager.getContext(playerId);
    if (!ctxResult.success) return failure(ctxResult.error);

    const ctx = ctxResult.data;
    const objective = ctx.objectives.find((o) => o.objectiveId === objectiveId);
    if (!objective) {
      return failure(new InvalidProgressError(`Objective '${objectiveId}' not found`));
    }

    objective.isCompleted = true;
    objective.completedAt = now();
    objective.progress = 100;

    if (this._config.enableActivityTracking) {
      this._activityTracker.trackAction(ctx, "complete_objective", {
        targetId: objectiveId,
        metadata: { objectiveId },
      });
    }

    if (this._config.enableNotifications) {
      this._notificationCoordinator.notifyObjectiveUpdate(ctx, objectiveId, "completed");
    }

    if (this._config.enableAutoProgress) {
      this._progressTracker.calculate(ctx);

      if (this._config.enableNotifications && ctx.progress.overall >= 25) {
        this._notificationCoordinator.notifyProgress(ctx, ctx.progress.overall);
      }
    }

    return success(ctx);
  }

  failObjective(playerId: string, objectiveId: string): Result<InvestigationContext> {
    const ctxResult = this._flowManager.getContext(playerId);
    if (!ctxResult.success) return failure(ctxResult.error);

    const ctx = ctxResult.data;
    const objective = ctx.objectives.find((o) => o.objectiveId === objectiveId);
    if (!objective) {
      return failure(new InvalidProgressError(`Objective '${objectiveId}' not found`));
    }

    objective.isFailed = true;
    objective.failedAt = now();

    if (this._config.enableActivityTracking) {
      this._activityTracker.trackAction(ctx, "complete_objective", {
        targetId: objectiveId,
        metadata: { objectiveId, status: "failed" },
      });
    }

    if (this._config.enableNotifications) {
      this._notificationCoordinator.notifyObjectiveUpdate(ctx, objectiveId, "failed");
    }

    return success(ctx);
  }

  getDiscoveryCounts(playerId: string): Result<Record<string, number>> {
    const ctxResult = this._flowManager.getContext(playerId);
    if (!ctxResult.success) return failure(ctxResult.error);
    return success(this._discoveryManager.getDiscoveryCounts(ctxResult.data));
  }

  getRecentDiscoveries(playerId: string, limit?: number): Result<DiscoveryEntry[]> {
    const ctxResult = this._flowManager.getContext(playerId);
    if (!ctxResult.success) return failure(ctxResult.error);
    return success(this._discoveryManager.getRecentDiscoveries(ctxResult.data, limit));
  }

  getKeyDiscoveries(playerId: string): Result<DiscoveryEntry[]> {
    const ctxResult = this._flowManager.getContext(playerId);
    if (!ctxResult.success) return failure(ctxResult.error);
    return success(this._discoveryManager.getKeyDiscoveries(ctxResult.data));
  }

  getActivityHistory(playerId: string): Result<unknown[]> {
    const ctxResult = this._flowManager.getContext(playerId);
    if (!ctxResult.success) return failure(ctxResult.error);
    return success(this._activityTracker.getHistory(ctxResult.data));
  }

  getProgressSummary(
    playerId: string,
  ): Result<{ overall: number; objectives: number; evidence: number; observations: number }> {
    const ctxResult = this._flowManager.getContext(playerId);
    if (!ctxResult.success) return failure(ctxResult.error);

    const ctx = ctxResult.data;
    if (this._config.enableAutoProgress) {
      this._progressTracker.calculate(ctx);
    }

    return success({
      overall: ctx.progress.overall,
      objectives: ctx.progress.objectives,
      evidence: ctx.progress.evidence,
      observations: ctx.progress.observations,
    });
  }

  getUnreadNotificationCount(playerId: string): Result<number> {
    const ctxResult = this._flowManager.getContext(playerId);
    if (!ctxResult.success) return failure(ctxResult.error);
    return success(this._notificationCoordinator.getUnreadCount(ctxResult.data));
  }

  isComplete(playerId: string): boolean {
    const ctxResult = this._flowManager.getContext(playerId);
    if (!ctxResult.success) return false;
    return ctxResult.data.isComplete;
  }

  // IInvestigationEngine implementation (bridging to external InvestigationState enum)

  async getState(caseId: string, playerId: string): Promise<Result<InvestigationState>> {
    const state = this._flowManager.getState(playerId);
    return success(
      (LIFECYCLE_TO_STATE[state as InvestigationLifecycleState] ??
        InvestigationState.IDLE) as InvestigationState,
    );
  }

  async setState(
    caseId: string,
    playerId: string,
    state: InvestigationState,
  ): Promise<Result<InvestigationState>> {
    const result = this._flowManager.transitionTo(playerId, state);
    if (!result.success) return failure(result.error);
    return success(
      (LIFECYCLE_TO_STATE[result.data.lifecycleState] ??
        InvestigationState.IDLE) as InvestigationState,
    );
  }

  async pause(caseId: string, playerId: string): Promise<Result<void>> {
    const result = this._flowManager.pause(playerId);
    if (!result.success) return failure(result.error);
    return success(undefined);
  }

  async resume(caseId: string, playerId: string): Promise<Result<void>> {
    const result = this._flowManager.resume(playerId);
    if (!result.success) return failure(result.error);
    return success(undefined);
  }

  async getElapsedTime(caseId: string, playerId: string): Promise<Result<number>> {
    return success(this._flowManager.getElapsedTime(playerId));
  }

  getPhases(): ReadonlyArray<string> {
    return [
      InvestigationState.IDLE,
      InvestigationState.EXPLORING,
      InvestigationState.OBSERVING,
      InvestigationState.COLLECTING,
      InvestigationState.INTERROGATING,
      InvestigationState.REASONING,
      InvestigationState.PAUSED,
      InvestigationState.CONCLUDED,
    ];
  }

  async getCurrentPhase(caseId: string, playerId: string): Promise<Result<string>> {
    const state = this._flowManager.getState(playerId);
    return success(
      LIFECYCLE_TO_STATE[state as InvestigationLifecycleState] ?? InvestigationState.IDLE,
    );
  }

  async advancePhase(caseId: string, playerId: string): Promise<Result<string>> {
    const contextResult = this._flowManager.getContext(playerId);
    if (!contextResult.success) return failure(contextResult.error);

    const ctx = contextResult.data;
    const currentState = ctx.lifecycleState;

    const advanceOrder: InvestigationLifecycleState[] = [
      "exploring",
      "inspecting",
      "interrogating",
      "analyzing",
      "reviewing",
    ];

    const currentIdx = advanceOrder.indexOf(currentState);
    if (currentIdx === -1) {
      return failure(new InvalidProgressError(`Cannot advance phase from '${currentState}'`));
    }

    const nextIdx = currentIdx + 1;
    if (nextIdx >= advanceOrder.length) {
      return failure(new InvalidProgressError(`Already at final phase '${currentState}'`));
    }

    const targetState = advanceOrder[nextIdx];
    if (!targetState) {
      return failure(new InvalidProgressError("No next phase available"));
    }

    const transitionResult = this._flowManager.transitionTo(playerId, targetState);
    if (!transitionResult.success) return failure(transitionResult.error);

    return success(
      LIFECYCLE_TO_STATE[transitionResult.data.lifecycleState] ?? InvestigationState.IDLE,
    );
  }

  async canAdvancePhase(caseId: string, playerId: string): Promise<Result<boolean>> {
    const contextResult = this._flowManager.getContext(playerId);
    if (!contextResult.success) return failure(contextResult.error);

    const ctx = contextResult.data;
    const currentState = ctx.lifecycleState;

    const advanceOrder: InvestigationLifecycleState[] = [
      "exploring",
      "inspecting",
      "interrogating",
      "analyzing",
      "reviewing",
    ];

    const currentIdx = advanceOrder.indexOf(currentState);
    if (currentIdx === -1) return success(false);

    const nextIdx = currentIdx + 1;
    if (nextIdx >= advanceOrder.length) return success(false);

    const targetState = advanceOrder[nextIdx];
    if (!targetState) return success(false);

    return success(this._lifecycle.canTransition(targetState));
  }

  async getLocationStatus(
    caseId: string,
    playerId: string,
    locationId: string,
  ): Promise<Result<boolean>> {
    const contextResult = this._flowManager.getContext(playerId);
    if (!contextResult.success) return failure(contextResult.error);

    const ctx = contextResult.data;
    return success(ctx.visitedLocationIds.has(locationId));
  }
}
