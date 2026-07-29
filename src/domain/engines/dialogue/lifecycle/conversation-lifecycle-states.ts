import type { ConversationLifecycleState } from "../types";

export const CONVERSATION_LIFECYCLE_STATES: Record<string, ConversationLifecycleState> = {
  UNAVAILABLE: "unavailable",
  AVAILABLE: "available",
  STARTING: "starting",
  ACTIVE: "active",
  WAITING: "waiting",
  PRESENTING_EVIDENCE: "presenting_evidence",
  CHOOSING_RESPONSE: "choosing_response",
  BRANCHING: "branching",
  COMPLETED: "completed",
  FAILED: "failed",
  INTERRUPTED: "interrupted",
  PAUSED: "paused",
  CANCELLED: "cancelled",
  ARCHIVED: "archived",
};

const TRANSITION_MAP: Record<ConversationLifecycleState, ReadonlySet<ConversationLifecycleState>> = {
  unavailable: new Set(["available", "archived"]),
  available: new Set(["starting", "archived"]),
  starting: new Set(["active", "failed", "cancelled", "archived"]),
  active: new Set([
    "waiting",
    "presenting_evidence",
    "choosing_response",
    "branching",
    "completed",
    "failed",
    "interrupted",
    "paused",
    "cancelled",
    "archived",
  ]),
  waiting: new Set(["active", "presenting_evidence", "choosing_response", "interrupted", "paused", "cancelled", "archived"]),
  presenting_evidence: new Set(["active", "waiting", "branching", "completed", "interrupted", "paused", "archived"]),
  choosing_response: new Set(["branching", "active", "completed", "interrupted", "paused", "cancelled", "archived"]),
  branching: new Set(["active", "choosing_response", "presenting_evidence", "waiting", "completed", "paused", "archived"]),
  completed: new Set(["archived"]),
  failed: new Set(["available", "archived"]),
  interrupted: new Set(["active", "cancelled", "archived"]),
  paused: new Set(["active", "interrupted", "cancelled", "archived"]),
  cancelled: new Set(["available", "archived"]),
  archived: new Set([]),
};

export function isValidTransition(
  from: ConversationLifecycleState,
  to: ConversationLifecycleState,
): boolean {
  if (from === to) return true;
  return TRANSITION_MAP[from]?.has(to) ?? false;
}

export function getAvailableTransitions(
  state: ConversationLifecycleState,
): ReadonlyArray<ConversationLifecycleState> {
  return Array.from(TRANSITION_MAP[state] ?? []);
}

export function isTerminalState(state: ConversationLifecycleState): boolean {
  return state === "completed" || state === "failed" || state === "archived";
}

export function isActiveState(state: ConversationLifecycleState): boolean {
  return (
    state === "active" ||
    state === "waiting" ||
    state === "presenting_evidence" ||
    state === "choosing_response" ||
    state === "branching"
  );
}

export function isEndState(state: ConversationLifecycleState): boolean {
  return state === "completed" || state === "failed" || state === "cancelled";
}

export function isPausableState(state: ConversationLifecycleState): boolean {
  return state === "active" || state === "choosing_response" || state === "waiting" || state === "branching";
}

export function getStateLabel(state: ConversationLifecycleState): string {
  const labels: Record<ConversationLifecycleState, string> = {
    unavailable: "Unavailable",
    available: "Available",
    starting: "Starting",
    active: "Active",
    waiting: "Waiting",
    presenting_evidence: "Presenting Evidence",
    choosing_response: "Choosing Response",
    branching: "Branching",
    completed: "Completed",
    failed: "Failed",
    interrupted: "Interrupted",
    paused: "Paused",
    cancelled: "Cancelled",
    archived: "Archived",
  };
  return labels[state];
}

export function getStateOrder(state: ConversationLifecycleState): number {
  const orders: Record<ConversationLifecycleState, number> = {
    unavailable: 0,
    available: 1,
    starting: 2,
    active: 3,
    waiting: 4,
    presenting_evidence: 5,
    choosing_response: 6,
    branching: 7,
    completed: 8,
    failed: 8,
    interrupted: 8,
    paused: 8,
    cancelled: 9,
    archived: 10,
  };
  return orders[state];
}
