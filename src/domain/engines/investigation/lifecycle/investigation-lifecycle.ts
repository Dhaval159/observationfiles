import type {
  InvestigationLifecycleState,
  LifecycleSnapshot,
  InvestigationContext,
} from "../types";
import {
  isValidTransition,
  getAvailableTransitions,
  isTerminalState,
  isActiveState,
  isExplorationState,
  getStateLabel,
} from "./investigation-lifecycle-states";
import { now } from "@/domain/value-objects/timestamp";

export class InvestigationLifecycle {
  private _currentState: InvestigationLifecycleState = "not_started";
  private _history: LifecycleSnapshot[] = [];
  private _context: InvestigationContext | null = null;

  get currentState(): InvestigationLifecycleState {
    return this._currentState;
  }

  get history(): readonly LifecycleSnapshot[] {
    return this._history;
  }

  get context(): InvestigationContext | null {
    return this._context;
  }

  get stateLabel(): string {
    return getStateLabel(this._currentState);
  }

  initialize(context: InvestigationContext): void {
    this._context = context;
    this._currentState = "not_started";
    this._history = [];
  }

  canTransition(to: InvestigationLifecycleState): boolean {
    return isValidTransition(this._currentState, to);
  }

  transition(
    to: InvestigationLifecycleState,
    metadata?: Record<string, unknown>,
  ): LifecycleSnapshot {
    if (!this.canTransition(to)) {
      throw new Error(
        `Invalid investigation lifecycle transition: '${this._currentState}' -> '${to}'. ` +
          `Available: [${getAvailableTransitions(this._currentState).join(", ")}]`,
      );
    }

    const timestamp = now();

    const snapshot: LifecycleSnapshot = {
      state: to,
      timestamp,
      metadata,
    };

    this._currentState = to;
    this._history.push(snapshot);

    if (this._context) {
      this._context.lifecycleState = to;
      this._context.lifecycleHistory.push(snapshot);
      this._context.updatedAt = timestamp;
    }

    return snapshot;
  }

  forceTransition(
    to: InvestigationLifecycleState,
    metadata?: Record<string, unknown>,
  ): LifecycleSnapshot {
    const timestamp = now();

    const snapshot: LifecycleSnapshot = {
      state: to,
      timestamp,
      metadata,
    };

    this._currentState = to;
    this._history.push(snapshot);

    if (this._context) {
      this._context.lifecycleState = to;
      this._context.lifecycleHistory.push(snapshot);
      this._context.updatedAt = timestamp;
    }

    return snapshot;
  }

  reset(): void {
    this._currentState = "not_started";
    this._history = [];
    this._context = null;
  }

  isTerminal(): boolean {
    return isTerminalState(this._currentState);
  }

  isActive(): boolean {
    return isActiveState(this._currentState);
  }

  isExploration(): boolean {
    return isExplorationState(this._currentState);
  }

  getTimeInState(state: InvestigationLifecycleState): number {
    const entries = this._history.filter((e) => e.state === state);
    if (entries.length < 2) return 0;
    const first = entries[0];
    const last = entries[entries.length - 1];
    if (!first || !last) return 0;
    return last.timestamp.differenceInSeconds(first.timestamp);
  }

  getTotalTime(): number {
    const first = this._history[0];
    const last = this._history[this._history.length - 1];
    if (!first || !last) return 0;
    return last.timestamp.differenceInSeconds(first.timestamp);
  }

  getAvailableActions(): InvestigationLifecycleState[] {
    return [...getAvailableTransitions(this._currentState)];
  }
}
