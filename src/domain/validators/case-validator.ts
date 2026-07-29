import type { Validator } from "./base-validator";
import type { ValidationResult } from "../models/validation-result";
import type { FullCase } from "../../types/case";
import { createValidationResult, createValidationError, createValidationWarning } from "../models/validation-result";

export class CaseValidator implements Validator<FullCase> {
  getValidatorId(): string {
    return "case-validator";
  }

  supports(input: unknown): boolean {
    if (!input || typeof input !== "object") return false;
    const obj = input as Record<string, unknown>;
    return typeof obj.id === "string" && typeof obj.title === "string";
  }

  validate(input: FullCase, _context: Record<string, unknown> = {}): ValidationResult {
    const errors = [];
    const warnings = [];

    if (!input.id || input.id.trim().length === 0) {
      errors.push(createValidationError("CASE_NO_ID", "Case must have a non-empty id", "id", "id"));
    }

    if (!input.title || input.title.trim().length === 0) {
      errors.push(createValidationError("CASE_NO_TITLE", "Case must have a title", "title", "title"));
    }

    if (input.title && input.title.trim().length > 200) {
      warnings.push(createValidationWarning("CASE_LONG_TITLE", "Case title exceeds 200 characters", "title", "title"));
    }

    if (!input.description || input.description.trim().length === 0) {
      warnings.push(createValidationWarning("CASE_NO_DESCRIPTION", "Case has no description", "description", "description"));
    }

    if (!input.metadata) {
      errors.push(createValidationError("CASE_NO_METADATA", "Case must have metadata", "metadata", "metadata"));
    }

    if (input.objectives && input.objectives.length === 0) {
      warnings.push(createValidationWarning("CASE_NO_OBJECTIVES", "Case has no objectives defined", "objectives", "objectives"));
    }

    if (!input.solution) {
      warnings.push(createValidationWarning("CASE_NO_SOLUTION", "Case has no solution defined", "solution", "solution"));
    }

    return createValidationResult(errors, warnings);
  }
}
