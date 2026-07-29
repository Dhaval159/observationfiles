import type { CaseContext, CaseEngineConfig } from "../types";
import type { CaseLifecycle } from "../lifecycle/case-lifecycle";
import type { CaseLoader } from "../types";
import type { CaseRegistry } from "../types";
import type { CasePersistence } from "../types";
import type { CaseDefinition, FullCase, CaseLocation } from "@/types/case";
import type { CaseProgress } from "@/domain/repositories/progress-repository";
import type { Result } from "@/domain/results/result";
import type { DomainTimestamp } from "@/domain/value-objects/timestamp";
import type { EventBus, DomainEvent } from "@/domain/events/base-event";
import { success, failure } from "@/domain/results/result";
import { now, createDomainTimestamp } from "@/domain/value-objects/timestamp";
import { CaseNotFoundError, CaseLockedError, InvalidProgressError, EngineError } from "@/domain/errors/domain-error";
import { createCaseContext, updateContextTimestamp, addContextError, cloneContext } from "../context/case-context";
import { createSession, pauseSession, resumeSession, getSessionSummary, resetSession } from "../session/case-session";

export class CaseManager {
  private _contexts: Map<string, CaseContext> = new Map();
  private _config: CaseEngineConfig;
  private _eventBus: EventBus | null = null;

  constructor(
    private readonly _lifecycle: CaseLifecycle,
    private readonly _loader: CaseLoader,
    private readonly _registry: CaseRegistry,
    private readonly _persistence: CasePersistence | null = null,
    config?: Partial<CaseEngineConfig>,
    eventBus?: EventBus,
  ) {
    this._config = {
      enableAutoSave: true,
      autoSaveIntervalSeconds: 300,
      maxSessionDurationMinutes: null,
      validateOnLoad: true,
      strictValidation: true,
      enableDependencyGraph: true,
      enableFlags: true,
      enableVariables: true,
      enableEventSystem: true,
      enablePersistence: true,
      ...config,
    };
    if (eventBus) {
      this._eventBus = eventBus;
    }
  }

  get config(): Readonly<CaseEngineConfig> {
    return this._config;
  }

  get eventBus(): EventBus | null {
    return this._eventBus;
  }

  setEventBus(eventBus: EventBus): void {
    this._eventBus = eventBus;
  }

  async openCase(caseId: string, playerId: string): Promise<Result<CaseContext>> {
    if (this._contexts.has(playerId)) {
      await this.closeCase(playerId);
    }

    const defResult = await this._loader.loadDefinition(caseId);
    if (!defResult.success) {
      return failure(defResult.error);
    }

    const session = createSession(caseId, playerId);
    const context = createCaseContext(playerId, session, {
      caseDefinition: defResult.data,
    });

    this._lifecycle.initialize(context);
    this._lifecycle.transition("loading");

    try {
      const fullResult = await this._loader.loadFullCase(caseId, playerId);
      if (fullResult.success) {
        context.activeCase = fullResult.data;
        context.objectives = this._buildObjectivesFromDefinition(fullResult.data);
      } else {
        context.objectives = this._buildObjectivesFromDefinition(defResult.data as unknown as FullCase);
      }

      this._lifecycle.transition("validating");
      this._lifecycle.transition("initializing");

      this._initializeContext(context);

      this._lifecycle.transition("ready");
      this._contexts.set(playerId, context);

      this._emitEvent("CASE_LOADED", {
        caseId,
        playerId,
      });

      return success(context);
    } catch (err) {
      this._lifecycle.transition("error");
      const error = err instanceof Error ? err : new Error(String(err));
      addContextError(context, error);
      this._emitEvent("GAME_ERROR", {
        errorCode: "CASE_OPEN_FAILED",
        errorMessage: error.message,
        context: { caseId, playerId },
      });
      return failure(new EngineError("CaseManager", `Failed to open case: ${error.message}`));
    }
  }

  async startCase(caseId: string, playerId: string): Promise<Result<CaseContext>> {
    const context = this._contexts.get(playerId);
    if (!context || context.session.caseId !== caseId) {
      return this.openCase(caseId, playerId);
    }

    if (!this._lifecycle.canTransition("running")) {
      return failure(new InvalidProgressError(`Cannot start case in state '${this._lifecycle.currentState}'`));
    }

    this._lifecycle.transition("running");

    this._emitEvent("CASE_STARTED", {
      caseId,
      playerId,
    });

    return success(context);
  }

  pauseCase(playerId: string): Result<CaseContext> {
    const context = this._contexts.get(playerId);
    if (!context) return failure(new CaseNotFoundError(playerId));

    if (!this._lifecycle.canTransition("paused")) {
      return failure(new InvalidProgressError(`Cannot pause case in state '${this._lifecycle.currentState}'`));
    }

    this._lifecycle.transition("paused");
    pauseSession(context.session);

    this._emitEvent("CASE_PAUSED", {
      caseId: context.session.caseId,
      playerId,
    });

    return success(context);
  }

  resumeCase(playerId: string): Result<CaseContext> {
    const context = this._contexts.get(playerId);
    if (!context) return failure(new CaseNotFoundError(playerId));

    if (!this._lifecycle.canTransition("running")) {
      return failure(new InvalidProgressError(`Cannot resume case in state '${this._lifecycle.currentState}'`));
    }

    this._lifecycle.transition("running");
    resumeSession(context.session);

    this._emitEvent("CASE_RESUMED", {
      caseId: context.session.caseId,
      playerId,
    });

    return success(context);
  }

  async completeCase(playerId: string): Promise<Result<CaseContext>> {
    const context = this._contexts.get(playerId);
    if (!context) return failure(new CaseNotFoundError(playerId));

    if (!this._lifecycle.canTransition("completing")) {
      return failure(new InvalidProgressError(`Cannot complete case in state '${this._lifecycle.currentState}'`));
    }

    this._lifecycle.transition("completing");

    try {
      this._lifecycle.transition("completed");

      this._emitEvent("CASE_COMPLETED", {
        caseId: context.session.caseId,
        playerId,
        score: context.progress?.score ?? 0,
        timeSpentSeconds: context.session.playTimeSeconds,
        hintsUsed: context.progress?.hintsUsed ?? 0,
        accuracy: (context.progress?.totalEvidence ?? 0) > 0
          ? (context.progress?.evidenceFound ?? 0) / (context.progress?.totalEvidence ?? 1)
          : 0,
      });

      return success(context);
    } catch (err) {
      this._lifecycle.transition("error");
      const error = err instanceof Error ? err : new Error(String(err));
      return failure(new EngineError("CaseManager", `Failed to complete case: ${error.message}`));
    }
  }

  failCase(playerId: string, reason: string): Result<CaseContext> {
    const context = this._contexts.get(playerId);
    if (!context) return failure(new CaseNotFoundError(playerId));

    if (!this._lifecycle.canTransition("failing")) {
      return failure(new InvalidProgressError(`Cannot fail case in state '${this._lifecycle.currentState}'`));
    }

    this._lifecycle.transition("failing");
    this._lifecycle.transition("failed");

    this._emitEvent("CASE_FAILED", {
      caseId: context.session.caseId,
      playerId,
      reason,
    });

    return success(context);
  }

  async resetCase(playerId: string): Promise<Result<CaseContext>> {
    const context = this._contexts.get(playerId);
    if (!context) return failure(new CaseNotFoundError(playerId));

    if (!this._lifecycle.canTransition("resetting")) {
      return failure(new InvalidProgressError(`Cannot reset case in state '${this._lifecycle.currentState}'`));
    }

    this._lifecycle.transition("resetting");

    const caseId = context.session.caseId;
    const defResult = await this._loader.loadDefinition(caseId);
    if (!defResult.success) {
      this._lifecycle.transition("error");
      return failure(defResult.error);
    }

    const session = resetSession(context.session, caseId, playerId);
    const newContext = createCaseContext(playerId, session, {
      caseDefinition: defResult.data,
      activeCase: context.activeCase,
    });

    this._lifecycle.initialize(newContext);
    this._lifecycle.transition("loading");
    this._lifecycle.transition("validating");
    this._lifecycle.transition("initializing");

    this._initializeContext(newContext);

    this._lifecycle.transition("ready");
    this._contexts.set(playerId, newContext);

    this._emitEvent("CASE_RESET", {
      caseId,
      playerId,
    });

    return success(newContext);
  }

  async closeCase(playerId: string): Promise<Result<void>> {
    const context = this._contexts.get(playerId);
    if (!context) return success(undefined);

    if (this._config.enablePersistence && this._persistence && this._lifecycle.isActive()) {
      await this._persistence.autoSave(context);
    }

    this._lifecycle.transition("unloading");
    this._lifecycle.transition("unloaded");

    this._contexts.delete(playerId);
    this._lifecycle.reset();

    this._emitEvent("CASE_CLOSED", {
      caseId: context.session.caseId,
      playerId,
    });

    return success(undefined);
  }

  getContext(playerId: string): Result<CaseContext> {
    const context = this._contexts.get(playerId);
    if (!context) return failure(new CaseNotFoundError(playerId));
    return success(context);
  }

  getCurrentState(playerId: string): Result<string> {
    const context = this._contexts.get(playerId);
    if (!context) return failure(new CaseNotFoundError(playerId));
    return success(context.lifecycleState);
  }

  isCaseActive(playerId: string): boolean {
    const context = this._contexts.get(playerId);
    if (!context) return false;
    return this._lifecycle.isActive();
  }

  getActiveContexts(): CaseContext[] {
    return [...this._contexts.values()];
  }

  getSessionSummary(playerId: string): Result<Record<string, unknown>> {
    const context = this._contexts.get(playerId);
    if (!context) return failure(new CaseNotFoundError(playerId));
    return success(getSessionSummary(context.session));
  }

  private _initializeContext(context: CaseContext): void {
    const def = context.activeCase ?? context.caseDefinition;
    if (!def) return;

    if (def.locations && def.locations.length > 0) {
      const firstLocation = def.locations[0] as CaseLocation;
      if (firstLocation) {
        context.session.currentLocationId = firstLocation.id;
        context.session.visitedLocationIds.add(firstLocation.id);
      }
    }

    if (def.objectives) {
      for (const objDef of def.objectives) {
        const objective = context.objectives.find((o) => o.id === objDef.id);
        if (objective && objDef.type === "primary") {
          context.session.activeObjectiveIds.add(objective.id);
        }
      }
    }
  }

  private _buildObjectivesFromDefinition(def: FullCase): import("@/domain/models/objective").Objective[] {
    return def.objectives.map((obj) => ({
      id: obj.id,
      caseId: def.id,
      description: obj.description,
      detailedDescription: obj.description,
      type: obj.type as import("@/domain/models/objective").ObjectiveType,
      priority: "normal" as import("@/domain/value-objects/priority").PriorityLevel,
      isCompleted: obj.isCompleted,
      completedAt: null,
      isRevealed: obj.isRevealed,
      revealedAt: null,
      parentObjectiveId: null,
      childObjectiveIds: [],
      requiredObjectiveIds: [],
      completionCondition: obj.completionCondition,
      failureCondition: null,
      hints: [],
      rewardXp: 0,
      rewardScore: 0,
      order: 0,
      tags: [],
    }));
  }

  private _emitEvent(type: string, payload: Record<string, unknown>): void {
    if (!this._config.enableEventSystem || !this._eventBus) return;

    const event: DomainEvent = {
      id: `${type}_${Date.now()}`,
      type,
      source: "CaseManager",
      timestamp: now(),
      metadata: payload,
    };

    this._eventBus.publish(event).catch(() => {});
  }
}
