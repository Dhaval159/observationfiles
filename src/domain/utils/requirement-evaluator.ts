import type { Requirement, RequirementSet } from "../models/unlock-condition";

export interface EvaluationContext {
  completedCases: string[];
  collectedEvidence: string[];
  observationsMade: string[];
  unlockedAchievements: string[];
  totalScore: number;
  playerLevel: number;
  visitedLocations: string[];
  completedObjectives: string[];
  [key: string]: unknown;
}

export function evaluateRequirement(requirement: Requirement, context: EvaluationContext): boolean {
  const value = context[requirement.type] ?? context[requirement.targetId];

  switch (requirement.operator) {
    case "equals":
      return value === requirement.value;
    case "not_equals":
      return value !== requirement.value;
    case "greater_than":
      return typeof value === "number" && typeof requirement.value === "number" && value > requirement.value;
    case "less_than":
      return typeof value === "number" && typeof requirement.value === "number" && value < requirement.value;
    case "contains":
      return Array.isArray(value) && value.includes(requirement.value);
    case "exists":
      return value !== undefined && value !== null;
    case "includes":
      return typeof value === "string" && typeof requirement.value === "string" && value.includes(requirement.value);
    default:
      return false;
  }
}

export function evaluateRequirementSet(set: RequirementSet, context: EvaluationContext): {
  isSatisfied: boolean;
  satisfiedCount: number;
  totalCount: number;
} {
  let satisfiedCount = 0;

  for (const req of set.requirements) {
    if (evaluateRequirement(req, context)) {
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

  return {
    isSatisfied,
    satisfiedCount,
    totalCount: set.requirements.length,
  };
}

export function evaluateRequirements(requirements: Requirement[], context: EvaluationContext): {
  allSatisfied: boolean;
  anySatisfied: boolean;
  satisfied: Requirement[];
  unsatisfied: Requirement[];
} {
  const satisfied: Requirement[] = [];
  const unsatisfied: Requirement[] = [];

  for (const req of requirements) {
    if (evaluateRequirement(req, context)) {
      satisfied.push(req);
    } else {
      unsatisfied.push(req);
    }
  }

  return {
    allSatisfied: unsatisfied.length === 0,
    anySatisfied: satisfied.length > 0,
    satisfied,
    unsatisfied,
  };
}

export function getMissingRequirements(requirements: Requirement[], context: EvaluationContext): Requirement[] {
  return requirements.filter((req) => !evaluateRequirement(req, context));
}

export function getRequirementProgress(requirement: Requirement, context: EvaluationContext): { current: number; target: number; percentage: number } {
  const value = context[requirement.type] ?? context[requirement.targetId];
  let current = 0;
  let target = 1;

  if (typeof value === "number" && typeof requirement.value === "number") {
    current = value;
    target = requirement.value;
  } else if (Array.isArray(value) && typeof requirement.value === "number") {
    current = value.length;
    target = requirement.value;
  }

  return {
    current: Math.min(current, target),
    target,
    percentage: target > 0 ? Math.min(100, (current / target) * 100) : 0,
  };
}
