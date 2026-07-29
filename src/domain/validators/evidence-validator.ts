import type { Validator } from "./base-validator";
import type { ValidationResult } from "../models/validation-result";
import type { FullEvidence } from "../../types/evidence";
import { createValidationResult, createValidationError, createValidationWarning } from "../models/validation-result";

export class EvidenceValidator implements Validator<FullEvidence> {
  getValidatorId(): string {
    return "evidence-validator";
  }

  supports(input: unknown): boolean {
    if (!input || typeof input !== "object") return false;
    const obj = input as Record<string, unknown>;
    return typeof obj.id === "string" && typeof obj.caseId === "string";
  }

  validate(input: FullEvidence, _context: Record<string, unknown> = {}): ValidationResult {
    const errors = [];
    const warnings = [];

    if (!input.id || input.id.trim().length === 0) {
      errors.push(createValidationError("EVIDENCE_NO_ID", "Evidence must have a non-empty id", "id", "id"));
    }

    if (!input.caseId || input.caseId.trim().length === 0) {
      errors.push(createValidationError("EVIDENCE_NO_CASE_ID", "Evidence must belong to a case", "caseId", "caseId"));
    }

    if (!input.name || input.name.trim().length === 0) {
      errors.push(createValidationError("EVIDENCE_NO_NAME", "Evidence must have a name", "name", "name"));
    }

    if (!input.type) {
      errors.push(createValidationError("EVIDENCE_NO_TYPE", "Evidence must have a type", "type", "type"));
    }

    if (!input.category) {
      warnings.push(createValidationWarning("EVIDENCE_NO_CATEGORY", "Evidence has no category", "category", "category"));
    }

    if (input.confidenceLevel !== undefined && (input.confidenceLevel < 0 || input.confidenceLevel > 1)) {
      errors.push(createValidationError("EVIDENCE_INVALID_CONFIDENCE", "Confidence level must be between 0 and 1", "confidenceLevel", "confidenceLevel"));
    }

    if (input.collectedAt && !input.location) {
      warnings.push(createValidationWarning("EVIDENCE_COLLECTED_NO_LOCATION", "Collected evidence has no location", "location", "location"));
    }

    return createValidationResult(errors, warnings);
  }
}
