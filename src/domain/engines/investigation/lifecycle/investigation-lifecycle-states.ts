import type { InvestigationLifecycleState } from "../types";

export const INVESTIGATION_STATES: readonly InvestigationLifecycleState[] = [
  "not_started",
  "preparing",
  "exploring",
  "inspecting",
  "interrogating",
  "analyzing",
  "reviewing",
  "paused",
  "completed",
  "failed",
  "abandoned",
] as const;

export const VALID_TRANSITIONS: ReadonlyMap<InvestigationLifecycleState, readonly InvestigationLifecycleState[]> = new Map([
  ["not_started", ["preparing"]],
  ["preparing", ["exploring", "failed", "abandoned"]],
  ["exploring", ["inspecting", "interrogating", "analyzing", "paused", "completed", "failed", "abandoned"]],
  ["inspecting", ["exploring", "analyzing", "paused", "completed", "failed"]],
  ["interrogating", ["exploring", "inspecting", "analyzing", "paused", "completed", "failed"]],
  ["analyzing", ["exploring", "inspecting", "reviewing", "paused", "completed", "failed"]],
  ["reviewing", ["exploring", "analyzing", "paused", "completed", "failed"]],
  ["paused", ["exploring", "inspecting", "interrogating", "analyzing", "reviewing", "failed", "abandoned"]],
  ["completed", []],
  ["failed", []],
  ["abandoned", []],
]);

export const TERMINAL_STATES: readonly InvestigationLifecycleState[] = [
  "completed",
  "failed",
  "abandoned",
] as const;

export const ACTIVE_STATES: readonly InvestigationLifecycleState[] = [
  "preparing",
  "exploring",
  "inspecting",
  "interrogating",
  "analyzing",
  "reviewing",
] as const;

export const EXPLORATION_STATES: readonly InvestigationLifecycleState[] = [
  "exploring",
  "inspecting",
  "interrogating",
  "analyzing",
  "reviewing",
] as const;

export function isValidTransition(from: InvestigationLifecycleState, to: InvestigationLifecycleState): boolean {
  const allowed = VALID_TRANSITIONS.get(from);
  return allowed ? allowed.includes(to) : false;
}

export function isTerminalState(state: InvestigationLifecycleState): boolean {
  return (TERMINAL_STATES as readonly string[]).includes(state);
}

export function isActiveState(state: InvestigationLifecycleState): boolean {
  return (ACTIVE_STATES as readonly string[]).includes(state);
}

export function isExplorationState(state: InvestigationLifecycleState): boolean {
  return (EXPLORATION_STATES as readonly string[]).includes(state);
}

export function getAvailableTransitions(from: InvestigationLifecycleState): readonly InvestigationLifecycleState[] {
  return VALID_TRANSITIONS.get(from) ?? [];
}

export function getStateLabel(state: InvestigationLifecycleState): string {
  return state
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
