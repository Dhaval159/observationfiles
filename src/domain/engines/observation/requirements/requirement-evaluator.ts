import type { ObservationContext } from "../types";
import type { Requirement, RequirementSet } from "@/domain/models/unlock-condition";
import { evaluateRequirement } from "@/domain/utils/requirement-evaluator";

export interface RequirementEvaluationContext {
  collectedEvidence: string[];
  observationsMade: string[];
  visitedLocations: string[];
  completedObjectives: string[];
  unlockedAchievements: string[];
  npcsInterrogated: string[];
  playerLevel: number;
  totalScore: number;
  runtimeVariables: Map<string, unknown>;
  playerFlags: Map<string, unknown>;
  [key: string]: unknown;
}

export function buildRequirementContext(ctx: ObservationContext): RequirementEvaluationContext {
  const observationsMade: string[] = [];
  for (const [id, entry] of ctx.entries) {
    if (
      entry.lifecycleState === "observed" ||
      entry.lifecycleState === "verified" ||
      entry.lifecycleState === "rejected"
    ) {
      observationsMade.push(id);
    }
  }

  return {
    collectedEvidence: [],
    observationsMade,
    visitedLocations: [],
    completedObjectives: [],
    unlockedAchievements: [],
    npcsInterrogated: [],
    playerLevel: 1,
    totalScore: 0,
    runtimeVariables: ctx.runtimeVariables,
    playerFlags: ctx.playerFlags,
  };
}

export function evaluateSingleRequirement(
  requirement: Requirement,
  context: RequirementEvaluationContext,
): boolean {
  const typedReq = requirement as unknown as {
    type: string;
    targetId: string;
    operator: string;
    value: unknown;
  };

  if (typedReq.type === "runtime_variable") {
    const val = context.runtimeVariables.get(typedReq.targetId);
    switch (typedReq.operator) {
      case "equals":
        return val === typedReq.value;
      case "not_equals":
        return val !== typedReq.value;
      case "greater_than":
        return typeof val === "number" && typeof typedReq.value === "number" && val > typedReq.value;
      case "less_than":
        return typeof val === "number" && typeof typedReq.value === "number" && val < typedReq.value;
      case "exists":
        return val !== undefined && val !== null;
      default:
        return false;
    }
  }

  if (typedReq.type === "player_flag") {
    const val = context.playerFlags.get(typedReq.targetId);
    switch (typedReq.operator) {
      case "equals":
        return val === typedReq.value;
      case "not_equals":
        return val !== typedReq.value;
      case "exists":
        return val !== undefined && val !== null;
      default:
        return false;
    }
  }

  if (typedReq.type === "observation_made") {
    if (typedReq.operator === "count_greater_than") {
      return typeof typedReq.value === "number" && context.observationsMade.length > typedReq.value;
    }
    if (typedReq.operator === "count_at_least") {
      return typeof typedReq.value === "number" && context.observationsMade.length >= typedReq.value;
    }
  }

  return evaluateRequirement(
    requirement,
    context as unknown as import("@/domain/utils/requirement-evaluator").EvaluationContext,
  );
}

export function evaluateRequirementSet(
  set: RequirementSet,
  context: RequirementEvaluationContext,
): { isSatisfied: boolean; satisfiedCount: number; totalCount: number } {
  let satisfiedCount = 0;

  for (const req of set.requirements) {
    if (evaluateSingleRequirement(req, context)) {
      satisfiedCount++;
    }
  }

  let isSatisfied = false;
  switch (set.combinator) {
    case "all":
      isSatisfied = satisfiedCount === set.requirements.length;
      break;
    case "any":
      isSatisfied = satisfiedCount > 0;
      break;
    case "none":
      isSatisfied = satisfiedCount === 0;
      break;
    case "at_least":
      isSatisfied = satisfiedCount >= set.minRequired;
      break;
  }

  return { isSatisfied, satisfiedCount, totalCount: set.requirements.length };
}

export function evaluateRequirements(
  requirements: Requirement[],
  sets: RequirementSet[],
  requiredCount: number,
  combinator: "all" | "any" | "at_least",
  context: RequirementEvaluationContext,
): { isSatisfied: boolean; satisfiedCount: number; totalCount: number; details: RequirementResult[] } {
  const details: RequirementResult[] = [];

  for (const req of requirements) {
    const satisfied = evaluateSingleRequirement(req, context);
    details.push({ requirement: req, satisfied, type: "requirement" });
  }

  for (const set of sets) {
    const result = evaluateRequirementSet(set, context);
    details.push({
      requirement: set as unknown as Requirement,
      satisfied: result.isSatisfied,
      type: "set",
      setResult: result,
    });
  }

  const satisfiedCount = details.filter((d) => d.satisfied).length;
  const totalCount = requirements.length + sets.length;

  let isSatisfied = false;
  switch (combinator) {
    case "all":
      isSatisfied = satisfiedCount === totalCount;
      break;
    case "any":
      isSatisfied = satisfiedCount > 0;
      break;
    case "at_least":
      isSatisfied = satisfiedCount >= requiredCount;
      break;
  }

  return { isSatisfied, satisfiedCount, totalCount, details };
}

export interface RequirementResult {
  requirement: Requirement;
  satisfied: boolean;
  type: "requirement" | "set";
  setResult?: { isSatisfied: boolean; satisfiedCount: number; totalCount: number };
}

export function getMissingRequirements(
  requirements: Requirement[],
  context: RequirementEvaluationContext,
): Requirement[] {
  return requirements.filter((req) => !evaluateSingleRequirement(req, context));
}
