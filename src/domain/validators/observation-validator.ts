import type { Validator } from "./base-validator";
import type { ValidationResult } from "../models/validation-result";
import type { ObservationState } from "../../types/observation";
import { createValidationResult, createValidationError, createValidationWarning } from "../models/validation-result";

export class ObservationValidator implements Validator<ObservationState> {
  getValidatorId(): string {
    return "observation-validator";
  }

  supports(input: unknown): boolean {
    if (!input || typeof input !== "object") return false;
    const obj = input as Record<string, unknown>;
    return typeof obj.observationId === "string";
  }

  validate(input: ObservationState, _context: Record<string, unknown> = {}): ValidationResult {
    const errors = [];
    const warnings = [];

    if (!input.observationId || input.observationId.trim().length === 0) {
      errors.push(createValidationError("OBS_NO_ID", "Observation must have a non-empty id", "observationId", "observationId"));
    }

    if (input.confidenceLevel !== undefined && (input.confidenceLevel < 0 || input.confidenceLevel > 1)) {
      errors.push(createValidationError("OBS_INVALID_CONFIDENCE", "Confidence level must be between 0 and 1", "confidenceLevel", "confidenceLevel"));
    }

    if (input.isDiscovered && !input.discoveredAt) {
      warnings.push(createValidationWarning("OBS_DISCOVERED_NO_TIMESTAMP", "Discovered observation has no timestamp", "discoveredAt", "discoveredAt"));
    }

    if (input.isAnalyzed && !input.analyzedAt) {
      warnings.push(createValidationWarning("OBS_ANALYZED_NO_TIMESTAMP", "Analyzed observation has no timestamp", "analyzedAt", "analyzedAt"));
    }

    return createValidationResult(errors, warnings);
  }
}
