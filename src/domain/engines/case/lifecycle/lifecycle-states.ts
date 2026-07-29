import type { CaseLifecycleState } from "../types";

export const LIFECYCLE_STATES: readonly CaseLifecycleState[] = [
  "unloaded",
  "loading",
  "validating",
  "initializing",
  "ready",
  "running",
  "paused",
  "completing",
  "completed",
  "failing",
  "failed",
  "resetting",
  "unloading",
  "error",
] as const;

export const VALID_TRANSITIONS: ReadonlyMap<CaseLifecycleState, readonly CaseLifecycleState[]> =
  new Map([
    ["unloaded", ["loading"]],
    ["loading", ["validating", "error", "unloaded"]],
    ["validating", ["initializing", "error", "unloaded"]],
    ["initializing", ["ready", "error", "unloaded"]],
    ["ready", ["running", "unloading", "error"]],
    ["running", ["paused", "completing", "failing", "error"]],
    ["paused", ["running", "unloading", "error"]],
    ["completing", ["completed", "error"]],
    ["completed", ["resetting", "unloading"]],
    ["failing", ["failed", "error"]],
    ["failed", ["resetting", "unloading"]],
    ["resetting", ["unloaded", "error"]],
    ["unloading", ["unloaded", "error"]],
    ["error", ["resetting", "unloading"]],
  ]);

export const TERMINAL_STATES: readonly CaseLifecycleState[] = [
  "completed",
  "failed",
  "unloaded",
] as const;

export const ACTIVE_STATES: readonly CaseLifecycleState[] = ["ready", "running", "paused"] as const;

export const TRANSITION_STATES: readonly CaseLifecycleState[] = [
  "loading",
  "validating",
  "initializing",
  "completing",
  "failing",
  "resetting",
  "unloading",
] as const;

export function isValidTransition(from: CaseLifecycleState, to: CaseLifecycleState): boolean {
  const allowed = VALID_TRANSITIONS.get(from);
  return allowed ? allowed.includes(to) : false;
}

export function isTerminalState(state: CaseLifecycleState): boolean {
  return (TERMINAL_STATES as readonly string[]).includes(state);
}

export function isActiveState(state: CaseLifecycleState): boolean {
  return (ACTIVE_STATES as readonly string[]).includes(state);
}

export function isTransitionState(state: CaseLifecycleState): boolean {
  return (TRANSITION_STATES as readonly string[]).includes(state);
}

export function getAvailableTransitions(from: CaseLifecycleState): readonly CaseLifecycleState[] {
  return VALID_TRANSITIONS.get(from) ?? [];
}
