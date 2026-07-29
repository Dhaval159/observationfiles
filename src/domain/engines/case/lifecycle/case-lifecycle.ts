import type { CaseLifecycleState, LifecycleEvent, CaseContext } from "../types";
import {
  isValidTransition,
  isTerminalState,
  isActiveState,
  isTransitionState,
  getAvailableTransitions,
} from "./lifecycle-states";
import { createDomainTimestamp } from "@/domain/value-objects/timestamp";

export class CaseLifecycle {
  private _currentState: CaseLifecycleState = "unloaded";
  private _history: LifecycleEvent[] = [];
  private _context: CaseContext | null = null;

  get currentState(): CaseLifecycleState {
    return this._currentState;
  }

  get history(): readonly LifecycleEvent[] {
    return this._history;
  }

  get context(): CaseContext | null {
    return this._context;
  }

  initialize(context: CaseContext): void {
    this._context = context;
    this._currentState = "unloaded";
    this._history = [];
  }

  canTransition(to: CaseLifecycleState): boolean {
    return isValidTransition(this._currentState, to);
  }

  transition(to: CaseLifecycleState, metadata?: Record<string, unknown>): LifecycleEvent {
    if (!this.canTransition(to)) {
      throw new Error(
        `Invalid lifecycle transition: '${this._currentState}' -> '${to}'. ` +
          `Available: [${getAvailableTransitions(this._currentState).join(", ")}]`,
      );
    }

    const previousState = this._currentState;
    const timestamp = createDomainTimestamp();

    const event: LifecycleEvent = {
      type: to,
      previousState,
      timestamp,
      metadata,
    };

    this._currentState = to;
    this._history.push(event);

    if (this._context) {
      this._context.lifecycleState = to;
      this._context.lifecycleHistory.push(event);
      this._context.updatedAt = timestamp;
    }

    return event;
  }

  reset(): void {
    this._currentState = "unloaded";
    this._history = [];
    this._context = null;
  }

  isTerminal(): boolean {
    return isTerminalState(this._currentState);
  }

  isActive(): boolean {
    return isActiveState(this._currentState);
  }

  isTransitioning(): boolean {
    return isTransitionState(this._currentState);
  }

  getErrorState(): CaseLifecycleState {
    return "error";
  }

  getTotalTimeInState(state: CaseLifecycleState): number {
    const relevantEvents = this._history.filter(
      (e) => e.type === state || e.previousState === state,
    );
    if (relevantEvents.length < 2) return 0;
    const startEvent = relevantEvents[0];
    const endEvent = relevantEvents[relevantEvents.length - 1];
    if (!startEvent || !endEvent) return 0;
    return endEvent.timestamp.differenceInSeconds(startEvent.timestamp);
  }
}
