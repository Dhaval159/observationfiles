import type { ObservationLifecycleState } from "../types";

export const OBSERVATION_LIFECYCLE_STATES: Record<string, ObservationLifecycleState> = {
  HIDDEN: "hidden",
  AVAILABLE: "available",
  INSPECTING: "inspecting",
  OBSERVED: "observed",
  VERIFIED: "verified",
  REJECTED: "rejected",
  LOCKED: "locked",
  ARCHIVED: "archived",
};

const TRANSITION_MAP: Record<ObservationLifecycleState, ReadonlySet<ObservationLifecycleState>> = {
  hidden: new Set(["available", "archived"]),
  available: new Set(["inspecting", "archived"]),
  inspecting: new Set(["observed", "available", "archived"]),
  observed: new Set(["verified", "rejected", "locked", "archived", "available"]),
  verified: new Set(["rejected", "locked", "archived"]),
  rejected: new Set(["available", "archived"]),
  locked: new Set(["archived"]),
  archived: new Set([]),
};

export function isValidTransition(
  from: ObservationLifecycleState,
  to: ObservationLifecycleState,
): boolean {
  if (from === to) return true;
  return TRANSITION_MAP[from]?.has(to) ?? false;
}

export function getAvailableTransitions(
  state: ObservationLifecycleState,
): ReadonlyArray<ObservationLifecycleState> {
  return Array.from(TRANSITION_MAP[state] ?? []);
}

export function isTerminalState(state: ObservationLifecycleState): boolean {
  return state === "archived";
}

export function isActiveState(state: ObservationLifecycleState): boolean {
  return state !== "hidden" && state !== "archived";
}

export function isObservableState(state: ObservationLifecycleState): boolean {
  return (
    state === "available" ||
    state === "inspecting" ||
    state === "rejected"
  );
}

export function isCompletedState(state: ObservationLifecycleState): boolean {
  return state === "observed" || state === "verified" || state === "rejected" || state === "locked";
}

export function isPositiveOutcome(state: ObservationLifecycleState): boolean {
  return state === "observed" || state === "verified";
}

export function getStateLabel(state: ObservationLifecycleState): string {
  const labels: Record<ObservationLifecycleState, string> = {
    hidden: "Hidden",
    available: "Available",
    inspecting: "Inspecting",
    observed: "Observed",
    verified: "Verified",
    rejected: "Rejected",
    locked: "Locked",
    archived: "Archived",
  };
  return labels[state];
}

export function getStateOrder(state: ObservationLifecycleState): number {
  const orders: Record<ObservationLifecycleState, number> = {
    hidden: 0,
    available: 1,
    inspecting: 2,
    observed: 3,
    verified: 4,
    rejected: 4,
    locked: 5,
    archived: 6,
  };
  return orders[state];
}
