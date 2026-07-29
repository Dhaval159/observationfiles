import type { InvestigationContext, InvestigatablePlugin } from "../types";
import type { Result } from "@/domain/results/result";
import type { EventBus } from "@/domain/events/base-event";
import { success, failure } from "@/domain/results/result";
import { InvalidProgressError } from "@/domain/errors/domain-error";
import { InvestigationLifecycle } from "../lifecycle/investigation-lifecycle";
import { createInvestigationContext, touchContext } from "../context/investigation-context";
import { now } from "@/domain/value-objects/timestamp";

export class InvestigationFlowManager {
  private _contexts: Map<string, InvestigationContext> = new Map();
  private _plugins: Map<string, InvestigatablePlugin> = new Map();
  private _eventBus: EventBus | null = null;

  constructor(private readonly _lifecycle: InvestigationLifecycle) {}

  get eventBus(): EventBus | null {
    return this._eventBus;
  }

  setEventBus(eventBus: EventBus): void {
    this._eventBus = eventBus;
  }

  registerPlugin(plugin: InvestigatablePlugin): void {
    this._plugins.set(plugin.id, plugin);
  }

  unregisterPlugin(pluginId: string): boolean {
    return this._plugins.delete(pluginId);
  }

  getPlugin(pluginId: string): InvestigatablePlugin | undefined {
    return this._plugins.get(pluginId);
  }

  listPlugins(): InvestigatablePlugin[] {
    return [...this._plugins.values()];
  }

  async start(caseId: string, playerId: string): Promise<Result<InvestigationContext>> {
    const existing = this._contexts.get(playerId);
    if (existing && !existing.isComplete && !existing.isFailed && !existing.isAbandoned) {
      return success(existing);
    }

    const context = createInvestigationContext(caseId, playerId);
    context.startedAt = now();

    this._lifecycle.initialize(context);
    this._lifecycle.transition("preparing");
    this._lifecycle.transition("exploring");

    this._contexts.set(playerId, context);

    for (const plugin of this._plugins.values()) {
      try {
        await plugin.initialize(context);
        context.activeSystems.add(plugin.id);
      } catch {
        // plugin init failure is non-fatal
      }
    }

    this._emit("investigation_started", {
      caseId,
      playerId,
      contextId: context.id,
    });

    return success(context);
  }

  pause(playerId: string): Result<InvestigationContext> {
    const context = this._contexts.get(playerId);
    if (!context) {
      return failure(new InvalidProgressError("No active investigation to pause"));
    }

    if (context.isPaused) {
      return success(context);
    }

    if (!this._lifecycle.canTransition("paused")) {
      return failure(new InvalidProgressError(`Cannot pause from state '${this._lifecycle.currentState}'`));
    }

    this._lifecycle.transition("paused");
    context.isPaused = true;
    touchContext(context);

    for (const plugin of this._plugins.values()) {
      plugin.onStateChange?.("paused");
    }

    this._emit("investigation_paused", {
      caseId: context.caseId,
      playerId,
    });

    return success(context);
  }

  resume(playerId: string): Result<InvestigationContext> {
    const context = this._contexts.get(playerId);
    if (!context) {
      return failure(new InvalidProgressError("No investigation to resume"));
    }

    if (!context.isPaused) {
      return success(context);
    }

    const previousState = context.lifecycleHistory
      .filter((s) => s.state !== "paused")
      .pop();

    const targetState = previousState?.state ?? "exploring";

    if (!this._lifecycle.canTransition(targetState)) {
      return failure(new InvalidProgressError(`Cannot resume to '${targetState}'`));
    }

    this._lifecycle.transition(targetState);
    context.isPaused = false;
    touchContext(context);

    for (const plugin of this._plugins.values()) {
      plugin.onStateChange?.(targetState);
    }

    this._emit("investigation_resumed", {
      caseId: context.caseId,
      playerId,
    });

    return success(context);
  }

  async restart(caseId: string, playerId: string): Promise<Result<InvestigationContext>> {
    const existing = this._contexts.get(playerId);
    if (existing) {
      this._contexts.delete(playerId);
    }

    for (const plugin of this._plugins.values()) {
      try {
        await plugin.shutdown();
      } catch {
        // non-fatal
      }
    }

    return this.start(caseId, playerId);
  }

  cancel(playerId: string): Result<InvestigationContext> {
    const context = this._contexts.get(playerId);
    if (!context) {
      return failure(new InvalidProgressError("No investigation to cancel"));
    }

    context.isAbandoned = true;
    this._lifecycle.forceTransition("abandoned");
    touchContext(context);

    this._emit("investigation_abandoned", {
      caseId: context.caseId,
      playerId,
    });

    return success(context);
  }

  complete(playerId: string): Result<InvestigationContext> {
    const context = this._contexts.get(playerId);
    if (!context) {
      return failure(new InvalidProgressError("No investigation to complete"));
    }

    if (!this._lifecycle.canTransition("completed")) {
      return failure(new InvalidProgressError(`Cannot complete from state '${this._lifecycle.currentState}'`));
    }

    this._lifecycle.transition("completed");
    context.isComplete = true;
    context.completedAt = now();
    touchContext(context);

    for (const plugin of this._plugins.values()) {
      plugin.onStateChange?.("completed");
    }

    this._emit("investigation_completed", {
      caseId: context.caseId,
      playerId,
      totalTime: context.startedAt ? now().differenceInSeconds(context.startedAt) : 0,
    });

    return success(context);
  }

  setCurrentLocation(playerId: string, locationId: string): Result<InvestigationContext> {
    const context = this._contexts.get(playerId);
    if (!context) {
      return failure(new InvalidProgressError("No active investigation"));
    }

    if (context.currentLocationId !== locationId) {
      context.currentLocationId = locationId;
      context.visitedLocationIds.add(locationId);
      touchContext(context);

      this._emit("location_visited", {
        caseId: context.caseId,
        playerId,
        locationId,
      });
    }

    return success(context);
  }

  transitionTo(
    playerId: string,
    state: string,
    metadata?: Record<string, unknown>,
  ): Result<InvestigationContext> {
    const context = this._contexts.get(playerId);
    if (!context) {
      return failure(new InvalidProgressError("No active investigation"));
    }

    const targetState = state as InvestigationContext["lifecycleState"];
    if (!this._lifecycle.canTransition(targetState)) {
      return failure(
        new InvalidProgressError(
          `Cannot transition from '${this._lifecycle.currentState}' to '${state}'`,
        ),
      );
    }

    this._lifecycle.transition(targetState, metadata);
    touchContext(context);

    for (const plugin of this._plugins.values()) {
      plugin.onStateChange?.(targetState);
    }

    this._emit("state_change", {
      caseId: context.caseId,
      playerId,
      previousState: this._lifecycle.history[this._lifecycle.history.length - 2]?.state,
      newState: targetState,
    });

    return success(context);
  }

  getContext(playerId: string): Result<InvestigationContext> {
    const context = this._contexts.get(playerId);
    if (!context) {
      return failure(new InvalidProgressError("No active investigation for player"));
    }
    return success(context);
  }

  getState(playerId: string): string {
    const context = this._contexts.get(playerId);
    return context?.lifecycleState ?? "not_started";
  }

  isActive(playerId: string): boolean {
    const context = this._contexts.get(playerId);
    return context ? !context.isComplete && !context.isFailed && !context.isAbandoned && !context.isPaused : false;
  }

  getElapsedTime(playerId: string): number {
    const context = this._contexts.get(playerId);
    if (!context?.startedAt) return 0;
    return now().differenceInSeconds(context.startedAt);
  }

  getActiveContexts(): InvestigationContext[] {
    return [...this._contexts.values()].filter(
      (c) => !c.isComplete && !c.isFailed && !c.isAbandoned,
    );
  }

  private _emit(type: string, payload: Record<string, unknown>): void {
    if (!this._eventBus) return;

    const event = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      type,
      source: "InvestigationFlowManager",
      timestamp: now(),
      metadata: payload,
    };

    this._eventBus.publish(event).catch(() => {});
  }
}
