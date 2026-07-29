import type { CaseDefinition } from "@/types/case";
import type { ValidationResult } from "@/types/engine";
import type { InvestigationState } from "@/types/investigation";

export function loadCaseFromJSON(json: string): CaseDefinition {
  const data = JSON.parse(json);

  if (!data.id || typeof data.id !== "string") {
    throw new Error("Case definition must have a string id");
  }
  if (!data.title || typeof data.title !== "string") {
    throw new Error("Case definition must have a string title");
  }

  return data as CaseDefinition;
}

export function validateCaseStructure(data: unknown): ValidationResult {
  const errors: { code: string; message: string; path: string; severity: "error" }[] = [];
  const warnings: { code: string; message: string; path: string; severity: "warning" | "info" }[] =
    [];

  if (!data || typeof data !== "object") {
    return {
      isValid: false,
      errors: [
        { code: "INVALID_TYPE", message: "Expected an object", path: "", severity: "error" },
      ],
      warnings: [],
    };
  }

  const obj = data as Record<string, unknown>;

  if (!obj.id || typeof obj.id !== "string") {
    errors.push({
      code: "MISSING_ID",
      message: "Case must have a string id",
      path: "id",
      severity: "error",
    });
  }
  if (!obj.title || typeof obj.title !== "string") {
    errors.push({
      code: "MISSING_TITLE",
      message: "Case must have a string title",
      path: "title",
      severity: "error",
    });
  }
  if (!obj.description || typeof obj.description !== "string") {
    warnings.push({
      code: "MISSING_DESCRIPTION",
      message: "Case missing description",
      path: "description",
      severity: "warning",
    });
  }
  if (
    !obj.difficulty ||
    !["beginner", "intermediate", "advanced", "expert"].includes(obj.difficulty as string)
  ) {
    errors.push({
      code: "INVALID_DIFFICULTY",
      message: "Case must have a valid difficulty",
      path: "difficulty",
      severity: "error",
    });
  }
  if (!obj.metadata || typeof obj.metadata !== "object") {
    warnings.push({
      code: "MISSING_METADATA",
      message: "Case missing metadata",
      path: "metadata",
      severity: "warning",
    });
  }
  if (!Array.isArray(obj.objectives)) {
    warnings.push({
      code: "MISSING_OBJECTIVES",
      message: "Case has no objectives",
      path: "objectives",
      severity: "warning",
    });
  }
  if (!Array.isArray(obj.locations)) {
    errors.push({
      code: "MISSING_LOCATIONS",
      message: "Case must have locations",
      path: "locations",
      severity: "error",
    });
  }
  if (!Array.isArray(obj.chapters)) {
    warnings.push({
      code: "MISSING_CHAPTERS",
      message: "Case has no chapters",
      path: "chapters",
      severity: "warning",
    });
  }
  if (!obj.solution || typeof obj.solution !== "object") {
    errors.push({
      code: "MISSING_SOLUTION",
      message: "Case must have a solution",
      path: "solution",
      severity: "error",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function getCaseProgressSummary(
  state: InvestigationState,
  caseDef: CaseDefinition,
): {
  chapterProgress: number;
  objectiveProgress: number;
  evidenceProgress: number;
  observationProgress: number;
  overall: number;
} {
  const totalChapters = caseDef.chapters.length;
  const chapterProgress = totalChapters > 0 ? (state.currentChapter + 1) / totalChapters : 1;

  const allObjectives = caseDef.objectives.filter((o) => o.type !== "hidden");
  const objectiveProgress =
    allObjectives.length > 0
      ? state.completedObjectives.filter((id) => allObjectives.some((o) => o.id === id)).length /
        allObjectives.length
      : 1;

  const requiredEvidence = caseDef.solution.requiredEvidence;
  const evidenceProgress =
    requiredEvidence.length > 0
      ? requiredEvidence.filter((id) => state.discoveredEvidence.has(id)).length /
        requiredEvidence.length
      : 1;

  const requiredObservations = caseDef.solution.requiredObservations;
  const observationProgress =
    requiredObservations.length > 0
      ? requiredObservations.filter((id) => state.discoveredObservations.has(id)).length /
        requiredObservations.length
      : 1;

  const overall =
    chapterProgress * 0.25 +
    objectiveProgress * 0.35 +
    evidenceProgress * 0.25 +
    observationProgress * 0.15;

  return {
    chapterProgress,
    objectiveProgress,
    evidenceProgress,
    observationProgress,
    overall,
  };
}

export function getNextUnlockableCases(
  completedCases: string[],
  allCases: CaseDefinition[],
): CaseDefinition[] {
  return allCases.filter((caseDef) => {
    if (completedCases.includes(caseDef.id)) return false;
    const condition = caseDef.unlockCondition;
    if (!condition) return true;
    if (condition.type === "previous_case") {
      const caseId = condition.config.caseId as string;
      return completedCases.includes(caseId);
    }
    return false;
  });
}
