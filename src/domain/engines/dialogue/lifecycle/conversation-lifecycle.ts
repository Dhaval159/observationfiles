import type {
  ConversationLifecycleState,
  ConversationLifecycleSnapshot,
  ConversationEntry,
} from "../types";
import {
  isValidTransition,
  getAvailableTransitions,
  getStateLabel,
} from "./conversation-lifecycle-states";
import { now } from "@/domain/value-objects/timestamp";

export class ConversationLifecycle {
  private _currentState: ConversationLifecycleState = "unavailable";
  private _history: ConversationLifecycleSnapshot[] = [];
  private _entry: ConversationEntry | null = null;

  get currentState(): ConversationLifecycleState {
    return this._currentState;
  }

  get history(): readonly ConversationLifecycleSnapshot[] {
    return this._history;
  }

  get stateLabel(): string {
    return getStateLabel(this._currentState);
  }

  initialize(state: ConversationLifecycleState): void {
    this._currentState = state;
    const snapshot: ConversationLifecycleSnapshot = {
      state,
      previousState: state,
      timestamp: now(),
      source: "initialization",
    };
    this._history = [snapshot];
  }

  attach(entry: ConversationEntry): void {
    this._entry = entry;
    this._currentState = entry.lifecycleState;
    this._history = [...entry.lifecycleHistory];
  }

  canTransition(to: ConversationLifecycleState): boolean {
    return isValidTransition(this._currentState, to);
  }

  transition(
    to: ConversationLifecycleState,
    source: string,
    metadata?: Record<string, unknown>,
  ): ConversationLifecycleSnapshot {
    if (!this.canTransition(to)) {
      throw new Error(
        `Invalid conversation lifecycle transition: '${this._currentState}' -> '${to}'. ` +
        `Available: [${getAvailableTransitions(this._currentState).join(", ")}]`,
      );
    }

    const previousState = this._currentState;
    const timestamp = now();

    const snapshot: ConversationLifecycleSnapshot = {
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
    to: ConversationLifecycleState,
    source: string,
    metadata?: Record<string, unknown>,
  ): ConversationLifecycleSnapshot {
    const previousState = this._currentState;
    const timestamp = now();

    const snapshot: ConversationLifecycleSnapshot = {
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

  getAvailableActions(): ReadonlyArray<ConversationLifecycleState> {
    return getAvailableTransitions(this._currentState);
  }

  reset(): void {
    this._currentState = "unavailable";
    this._history = [];
    this._entry = null;
  }
}
