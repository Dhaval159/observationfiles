import type { Validator } from "./base-validator";
import type { ValidationResult } from "../models/validation-result";
import { createValidationResult, createValidationError, createValidationWarning } from "../models/validation-result";
import type { CaseProgress, PlayerProgress } from "../repositories/progress-repository";

export class ProgressValidator implements Validator<CaseProgress> {
  getValidatorId(): string {
    return "progress-validator";
  }

  supports(input: unknown): boolean {
    if (!input || typeof input !== "object") return false;
    const obj = input as Record<string, unknown>;
    return typeof obj.caseId === "string" && typeof obj.playerId === "string";
  }

  validate(input: CaseProgress, _context: Record<string, unknown> = {}): ValidationResult {
    const errors = [];
    const warnings = [];

    if (!input.playerId || input.playerId.trim().length === 0) {
      errors.push(createValidationError("PROGRESS_NO_PLAYER", "Progress must have a player id", "playerId", "playerId"));
    }

    if (!input.caseId || input.caseId.trim().length === 0) {
      errors.push(createValidationError("PROGRESS_NO_CASE", "Progress must have a case id", "caseId", "caseId"));
    }

    if (input.score < 0) {
      errors.push(createValidationError("PROGRESS_NEGATIVE_SCORE", "Score cannot be negative", "score", "score"));
    }

    if (input.timeSpentSeconds < 0) {
      errors.push(createValidationError("PROGRESS_NEGATIVE_TIME", "Time spent cannot be negative", "timeSpentSeconds", "timeSpentSeconds"));
    }

    if (input.evidenceFound < 0) {
      errors.push(createValidationError("PROGRESS_NEGATIVE_EVIDENCE", "Evidence found cannot be negative", "evidenceFound", "evidenceFound"));
    }

    if (input.observationsMade < 0) {
      errors.push(createValidationError("PROGRESS_NEGATIVE_OBSERVATIONS", "Observations made cannot be negative", "observationsMade", "observationsMade"));
    }

    if (input.hintsUsed < 0) {
      warnings.push(createValidationWarning("PROGRESS_NEGATIVE_HINTS", "Hints used is negative", "hintsUsed", "hintsUsed"));
    }

    return createValidationResult(errors, warnings);
  }
}
