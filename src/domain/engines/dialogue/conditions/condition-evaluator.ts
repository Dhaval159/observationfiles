import type {
  DialogueConditionDefinition,
  DialogueContext,
  NPCStateDefinition,
} from "../types";

export interface DialogueConditionContext {
  collectedEvidence: string[];
  presentedEvidence: string[];
  observationsMade: string[];
  observationsVerified: string[];
  visitedLocations: string[];
  completedObjectives: string[];
  askedQuestions: string[];
  unlockedTopics: string[];
  previousChoices: string[];
  runtimeVariables: Map<string, unknown>;
  playerFlags: Map<string, unknown>;
  elapsedTimeMs: number;
  visitCount: number;
  [key: string]: unknown;
}

export function buildConditionContext(
  ctx: DialogueContext,
  npcState?: NPCStateDefinition,
): DialogueConditionContext {
  const conversation = ctx.currentConversationId
    ? ctx.conversations.get(ctx.currentConversationId)
    : null;

  return {
    collectedEvidence: [],
    presentedEvidence: conversation?.presentedEvidence.map((e) => e.evidenceId) ?? [],
    observationsMade: [],
    observationsVerified: [],
    visitedLocations: [],
    completedObjectives: [],
    askedQuestions: conversation?.askedQuestions ?? [],
    unlockedTopics: conversation?.unlockedTopics ?? [],
    previousChoices: conversation?.choiceHistory.map((c) => c.choiceId) ?? [],
    runtimeVariables: ctx.runtimeVariables,
    playerFlags: ctx.playerFlags,
    elapsedTimeMs: conversation?.durationMs ?? 0,
    visitCount: 0,
  };
}

export function evaluateSingleCondition(
  condition: DialogueConditionDefinition,
  context: DialogueConditionContext,
  npcState?: NPCStateDefinition,
): boolean {
  switch (condition.type) {
    case "evidence_collected":
      return evaluateContains(context.collectedEvidence, condition);
    case "evidence_presented":
      return evaluateContains(context.presentedEvidence, condition);
    case "observation_made":
      return evaluateContains(context.observationsMade, condition);
    case "observation_verified":
      return evaluateContains(context.observationsVerified, condition);
    case "npc_state":
      return evaluateNumericField(npcState, condition);
    case "trust_level":
      return evaluateNumericComparison(npcState?.trust, condition);
    case "pressure_level":
      return evaluateNumericComparison(npcState ? 100 - npcState.patience : undefined, condition);
    case "stress_level":
      return evaluateNumericComparison(npcState?.stress, condition);
    case "suspicion_level":
      return evaluateNumericComparison(npcState?.suspicion, condition);
    case "emotional_state":
      return evaluateStringComparison(npcState?.emotionalState, condition);
    case "relationship_status":
      return evaluateStringComparison(npcState?.relationship, condition);
    case "variable_value":
      return evaluateFromMap(context.runtimeVariables, condition);
    case "player_flag":
      return evaluateFromMap(context.playerFlags, condition);
    case "previous_choice":
      return evaluateContains(context.previousChoices, condition);
    case "question_asked":
      return evaluateContains(context.askedQuestions, condition);
    case "topic_unlocked":
      return evaluateContains(context.unlockedTopics, condition);
    case "location_visited":
      return evaluateContains(context.visitedLocations, condition);
    case "objective_completed":
      return evaluateContains(context.completedObjectives, condition);
    case "contradiction_found":
      return condition.operator === "exists"
        ? context[condition.type] !== undefined
        : false;
    case "time_elapsed":
      return evaluateNumericComparison(context.elapsedTimeMs, condition);
    case "visit_count":
      return evaluateNumericComparison(context.visitCount, condition);
    case "custom":
      return evaluateFromMap(context, condition);
    default:
      return false;
  }
}

export function evaluateConditions(
  conditions: DialogueConditionDefinition[],
  context: DialogueConditionContext,
  npcState?: NPCStateDefinition,
): boolean {
  if (conditions.length === 0) return true;

  return conditions.every((c) =>
    evaluateSingleCondition(c, context, npcState),
  );
}

function evaluateNumericComparison(
  value: number | undefined,
  condition: DialogueConditionDefinition,
): boolean {
  if (value === undefined) return false;
  const target = condition.value as number;

  switch (condition.operator) {
    case "equals":
      return value === target;
    case "not_equals":
      return value !== target;
    case "greater_than":
      return value > target;
    case "less_than":
      return value < target;
    case "greater_than_or_equal":
      return value >= target;
    case "less_than_or_equal":
      return value <= target;
    case "between":
      if (Array.isArray(condition.value) && condition.value.length === 2) {
        return value >= (condition.value[0] as number) && value <= (condition.value[1] as number);
      }
      return false;
    default:
      return false;
  }
}

function evaluateStringComparison(
  value: string | undefined,
  condition: DialogueConditionDefinition,
): boolean {
  if (value === undefined) return false;

  switch (condition.operator) {
    case "equals":
      return value === condition.value;
    case "not_equals":
      return value !== condition.value;
    case "contains":
      return typeof condition.value === "string" && value.toLowerCase().includes(condition.value.toLowerCase());
    case "in":
      return Array.isArray(condition.value) && condition.value.includes(value);
    case "not_in":
      return Array.isArray(condition.value) && !condition.value.includes(value);
    case "exists":
      return true;
    case "not_exists":
      return false;
    default:
      return false;
  }
}

function evaluateContains(
  array: string[],
  condition: DialogueConditionDefinition,
): boolean {
  switch (condition.operator) {
    case "contains":
      return Array.isArray(condition.targetId)
        ? array.some((item) => (condition.targetId as unknown as string[]).includes(item))
        : array.includes(condition.targetId);
    case "not_contains":
      return !array.includes(condition.targetId);
    case "exists":
      return array.length > 0;
    default:
      return false;
  }
}

function evaluateFromMap(
  map: Map<string, unknown> | Record<string, unknown>,
  condition: DialogueConditionDefinition,
): boolean {
  const getVal = (m: Map<string, unknown> | Record<string, unknown>, key: string): unknown => {
    if (m instanceof Map) return m.get(condition.targetId);
    return (m as Record<string, unknown>)[condition.targetId];
  };

  const value = getVal(map, condition.targetId);

  switch (condition.operator) {
    case "equals":
      return value === condition.value;
    case "not_equals":
      return value !== condition.value;
    case "greater_than":
      return typeof value === "number" && typeof condition.value === "number" && value > condition.value;
    case "less_than":
      return typeof value === "number" && typeof condition.value === "number" && value < condition.value;
    case "exists":
      return value !== undefined && value !== null;
    case "not_exists":
      return value === undefined || value === null;
    case "contains":
      if (typeof value === "string" && typeof condition.value === "string") {
        return value.toLowerCase().includes(condition.value.toLowerCase());
      }
      if (Array.isArray(value) && condition.value !== undefined) {
        return value.includes(condition.value);
      }
      return false;
    default:
      return false;
  }
}

function evaluateNumericField(
  npcState: NPCStateDefinition | undefined,
  condition: DialogueConditionDefinition,
): boolean {
  if (!npcState) return false;

  const fieldValue = (npcState as unknown as Record<string, unknown>)[condition.targetId];
  if (fieldValue === undefined) return false;

  const numVal = typeof fieldValue === "string" ? parseFloat(fieldValue) : Number(fieldValue);
  if (isNaN(numVal)) return false;

  return evaluateNumericComparison(numVal, condition);
}
