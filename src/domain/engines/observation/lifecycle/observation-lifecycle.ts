import type {
  ObservationLifecycleState,
  ObservationLifecycleSnapshot,
  ObservationEntry,
} from "../types";
import {
  isValidTransition,
  getAvailableTransitions,
  getStateLabel,
} from "./observation-lifecycle-states";
import { now } from "@/domain/value-objects/timestamp";

export class ObservationLifecycle {
  private _currentState: ObservationLifecycleState = "hidden";
  private _history: ObservationLifecycleSnapshot[] = [];
  private _entry: ObservationEntry | null = null;

  get currentState(): ObservationLifecycleState {
    return this._currentState;
  }

  get history(): readonly ObservationLifecycleSnapshot[] {
    return this._history;
  }

  get stateLabel(): string {
    return getStateLabel(this._currentState);
  }

  initialize(state: ObservationLifecycleState): void {
    this._currentState = state;
    const snapshot: ObservationLifecycleSnapshot = {
      state,
      previousState: state,
      timestamp: now(),
      source: "initialization",
    };
    this._history = [snapshot];
  }

  attach(entry: ObservationEntry): void {
    this._entry = entry;
    this._currentState = entry.lifecycleState;
    this._history = [...entry.lifecycleHistory];
  }

  canTransition(to: ObservationLifecycleState): boolean {
    return isValidTransition(this._currentState, to);
  }

  transition(
    to: ObservationLifecycleState,
    source: string,
    metadata?: Record<string, unknown>,
  ): ObservationLifecycleSnapshot {
    if (!this.canTransition(to)) {
      throw new Error(
        `Invalid observation lifecycle transition: '${this._currentState}' -> '${to}'. ` +
          `Available: [${getAvailableTransitions(this._currentState).join(", ")}]`,
      );
    }

    const previousState = this._currentState;
    const timestamp = now();

    const snapshot: ObservationLifecycleSnapshot = {
      state: to,
      previousState,
      timestamp,
      source,
      metadata,
    };

    this._currentState = to;
    this._history.push(snapshot);

    return snapshot;
  }

  forceTransition(
    to: ObservationLifecycleState,
    source: string,
    metadata?: Record<string, unknown>,
  ): ObservationLifecycleSnapshot {
    const previousState = this._currentState;
    const timestamp = now();

    const snapshot: ObservationLifecycleSnapshot = {
      state: to,
      previousState,
      timestamp,
      source,
      metadata,
    };

    this._currentState = to;
    this._history.push(snapshot);

    return snapshot;
  }

  getTransitionCount(to: ObservationLifecycleState): number {
    return this._history.filter((s) => s.state === to).length;
  }

  getAvailableActions(): ReadonlyArray<ObservationLifecycleState> {
    return getAvailableTransitions(this._currentState);
  }

  reset(): void {
    this._currentState = "hidden";
    this._history = [];
    this._entry = null;
  }
}
