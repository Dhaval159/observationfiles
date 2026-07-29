import type {
  ValidationResult,
  ValidationError as IValidationError,
  ValidationWarning,
} from "@/types/engine";

export class ValidationError extends Error implements IValidationError {
  public readonly code: string;
  public readonly path: string;
  public readonly severity = "error" as const;

  constructor(code: string, message: string, path: string) {
    super(message);
    this.name = "ValidationError";
    this.code = code;
    this.path = path;
  }
}

export { type ValidationResult, type IValidationError, type ValidationWarning };

export function validateRequired<T>(value: T | null | undefined, fieldName: string): void {
  if (value === null || value === undefined) {
    throw new ValidationError("REQUIRED_FIELD", `"${fieldName}" is required`, fieldName);
  }
}

export function validateStringNotEmpty(value: string, fieldName: string): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ValidationError(
      "STRING_NOT_EMPTY",
      `"${fieldName}" must be a non-empty string`,
      fieldName,
    );
  }
}

export function validateMinLength(value: string, min: number, fieldName: string): void {
  if (value.length < min) {
    throw new ValidationError(
      "MIN_LENGTH",
      `"${fieldName}" must be at least ${min} characters`,
      fieldName,
    );
  }
}

export function validateMaxLength(value: string, max: number, fieldName: string): void {
  if (value.length > max) {
    throw new ValidationError(
      "MAX_LENGTH",
      `"${fieldName}" must be at most ${max} characters`,
      fieldName,
    );
  }
}

export function validateRange(value: number, min: number, max: number, fieldName: string): void {
  if (value < min || value > max) {
    throw new ValidationError(
      "OUT_OF_RANGE",
      `"${fieldName}" must be between ${min} and ${max}`,
      fieldName,
    );
  }
}

export function validatePositiveNumber(value: number, fieldName: string): void {
  if (value <= 0) {
    throw new ValidationError(
      "NOT_POSITIVE",
      `"${fieldName}" must be a positive number`,
      fieldName,
    );
  }
}

export function validateNonNegativeNumber(value: number, fieldName: string): void {
  if (value < 0) {
    throw new ValidationError(
      "NEGATIVE_NUMBER",
      `"${fieldName}" must be a non-negative number`,
      fieldName,
    );
  }
}

export function validateInteger(value: number, fieldName: string): void {
  if (!Number.isInteger(value)) {
    throw new ValidationError("NOT_INTEGER", `"${fieldName}" must be an integer`, fieldName);
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): boolean {
  return EMAIL_REGEX.test(value);
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}

export function validateArrayNotEmpty<T>(value: T[], fieldName: string): void {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ValidationError(
      "ARRAY_NOT_EMPTY",
      `"${fieldName}" must be a non-empty array`,
      fieldName,
    );
  }
}

export function validateEnum<T extends string>(
  value: string,
  allowedValues: readonly T[],
  fieldName: string,
): void {
  if (!allowedValues.includes(value as T)) {
    throw new ValidationError(
      "INVALID_ENUM",
      `"${fieldName}" must be one of: ${allowedValues.join(", ")}`,
      fieldName,
    );
  }
}

export function validateConfidence(value: number, fieldName: string): void {
  if (value < 0 || value > 1) {
    throw new ValidationError(
      "INVALID_CONFIDENCE",
      `"${fieldName}" must be between 0 and 1`,
      fieldName,
    );
  }
}

export function validatePercentage(value: number, fieldName: string): void {
  if (value < 0 || value > 100) {
    throw new ValidationError(
      "INVALID_PERCENTAGE",
      `"${fieldName}" must be between 0 and 100`,
      fieldName,
    );
  }
}

export function validateInFuture(value: Date | string, fieldName: string): void {
  const date = typeof value === "string" ? new Date(value) : value;
  if (isNaN(date.getTime())) {
    throw new ValidationError("INVALID_DATE", `"${fieldName}" is not a valid date`, fieldName);
  }
  if (date.getTime() <= Date.now()) {
    throw new ValidationError("NOT_IN_FUTURE", `"${fieldName}" must be in the future`, fieldName);
  }
}

export function validateInPast(value: Date | string, fieldName: string): void {
  const date = typeof value === "string" ? new Date(value) : value;
  if (isNaN(date.getTime())) {
    throw new ValidationError("INVALID_DATE", `"${fieldName}" is not a valid date`, fieldName);
  }
  if (date.getTime() >= Date.now()) {
    throw new ValidationError("NOT_IN_PAST", `"${fieldName}" must be in the past`, fieldName);
  }
}

export function validateCaseDefinition(caseDef: unknown): ValidationResult {
  const errors: IValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (typeof caseDef !== "object" || caseDef === null) {
    errors.push(
      new ValidationError(
        "INVALID_CASE_DEFINITION",
        "Case definition must be a non-null object",
        "",
      ),
    );
    return { isValid: false, errors, warnings };
  }

  const def = caseDef as Record<string, unknown>;

  if (typeof def.id !== "string" || def.id.length === 0) {
    errors.push(
      new ValidationError(
        "REQUIRED_FIELD",
        'Case "id" is required and must be a non-empty string',
        "id",
      ),
    );
  }

  if (typeof def.title !== "string" || def.title.length === 0) {
    errors.push(
      new ValidationError(
        "REQUIRED_FIELD",
        'Case "title" is required and must be a non-empty string',
        "title",
      ),
    );
  }

  if (typeof def.description !== "string" || def.description.length === 0) {
    errors.push(
      new ValidationError(
        "REQUIRED_FIELD",
        'Case "description" is required and must be a non-empty string',
        "description",
      ),
    );
  }

  const validDifficulties = ["beginner", "intermediate", "advanced", "expert"] as const;
  if (
    typeof def.difficulty !== "string" ||
    !(validDifficulties as readonly string[]).includes(def.difficulty)
  ) {
    errors.push(
      new ValidationError(
        "INVALID_ENUM",
        `Case "difficulty" must be one of: ${validDifficulties.join(", ")}`,
        "difficulty",
      ),
    );
  }

  if (typeof def.metadata !== "object" || def.metadata === null) {
    errors.push(new ValidationError("REQUIRED_FIELD", 'Case "metadata" is required', "metadata"));
  }

  if (!Array.isArray(def.objectives)) {
    errors.push(
      new ValidationError("REQUIRED_FIELD", 'Case "objectives" must be an array', "objectives"),
    );
  }

  if (!Array.isArray(def.locations)) {
    errors.push(
      new ValidationError("REQUIRED_FIELD", 'Case "locations" must be an array', "locations"),
    );
  }

  if (!Array.isArray(def.chapters)) {
    errors.push(
      new ValidationError("REQUIRED_FIELD", 'Case "chapters" must be an array', "chapters"),
    );
  }

  if (typeof def.solution !== "object" || def.solution === null) {
    errors.push(new ValidationError("REQUIRED_FIELD", 'Case "solution" is required', "solution"));
  }

  if (typeof def.config !== "object" || def.config === null) {
    errors.push(new ValidationError("REQUIRED_FIELD", 'Case "config" is required', "config"));
  }

  return { isValid: errors.length === 0, errors, warnings };
}

export function validateEvidenceDefinition(evidenceDef: unknown): ValidationResult {
  const errors: IValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (typeof evidenceDef !== "object" || evidenceDef === null) {
    errors.push(
      new ValidationError(
        "INVALID_EVIDENCE_DEFINITION",
        "Evidence definition must be a non-null object",
        "",
      ),
    );
    return { isValid: false, errors, warnings };
  }

  const def = evidenceDef as Record<string, unknown>;

  if (typeof def.id !== "string" || def.id.length === 0) {
    errors.push(
      new ValidationError(
        "REQUIRED_FIELD",
        'Evidence "id" is required and must be a non-empty string',
        "id",
      ),
    );
  }

  if (typeof def.caseId !== "string" || def.caseId.length === 0) {
    errors.push(
      new ValidationError(
        "REQUIRED_FIELD",
        'Evidence "caseId" is required and must be a non-empty string',
        "caseId",
      ),
    );
  }

  if (typeof def.name !== "string" || def.name.length === 0) {
    errors.push(
      new ValidationError(
        "REQUIRED_FIELD",
        'Evidence "name" is required and must be a non-empty string',
        "name",
      ),
    );
  }

  if (typeof def.description !== "string" || def.description.length === 0) {
    errors.push(
      new ValidationError(
        "REQUIRED_FIELD",
        'Evidence "description" is required and must be a non-empty string',
        "description",
      ),
    );
  }

  const validTypes = [
    "physical",
    "digital",
    "testimony",
    "document",
    "photograph",
    "audio",
    "video",
    "report",
    "receipt",
    "object",
    "fingerprint",
    "footprint",
    "dna",
    "tool",
    "weapon",
    "drug",
    "fiber",
    "digital_file",
    "email",
    "phone_record",
    "bank_statement",
    "social_media",
    "cctv",
    "letter",
    "note",
    "photo",
    "map",
    "diagram",
    "autopsy_report",
    "lab_report",
  ] as const;
  if (typeof def.type !== "string" || !(validTypes as readonly string[]).includes(def.type)) {
    errors.push(
      new ValidationError(
        "INVALID_ENUM",
        `Evidence "type" must be one of: ${validTypes.join(", ")}`,
        "type",
      ),
    );
  }

  const validCategories = [
    "weapon",
    "motive",
    "opportunity",
    "alibi",
    "timeline",
    "forensic",
    "physical",
    "digital",
    "testimony",
    "document",
    "circumstantial",
    "direct",
    "corroborating",
    "exculpatory",
    "inculpatory",
  ] as const;
  if (
    typeof def.category !== "string" ||
    !(validCategories as readonly string[]).includes(def.category)
  ) {
    errors.push(
      new ValidationError(
        "INVALID_ENUM",
        `Evidence "category" must be one of: ${validCategories.join(", ")}`,
        "category",
      ),
    );
  }

  if (typeof def.location !== "string" || def.location.length === 0) {
    errors.push(
      new ValidationError(
        "REQUIRED_FIELD",
        'Evidence "location" is required and must be a non-empty string',
        "location",
      ),
    );
  }

  if (typeof def.metadata !== "object" || def.metadata === null) {
    errors.push(
      new ValidationError("REQUIRED_FIELD", 'Evidence "metadata" is required', "metadata"),
    );
  }

  if (!Array.isArray(def.media)) {
    errors.push(
      new ValidationError("REQUIRED_FIELD", 'Evidence "media" must be an array', "media"),
    );
  }

  return { isValid: errors.length === 0, errors, warnings };
}

export function tryValidate(fn: () => void): ValidationResult {
  const warnings: ValidationWarning[] = [];
  try {
    fn();
    return { isValid: true, errors: [], warnings };
  } catch (error) {
    if (error instanceof ValidationError) {
      return { isValid: false, errors: [error], warnings };
    }
    return {
      isValid: false,
      errors: [
        new ValidationError(
          "UNKNOWN_ERROR",
          error instanceof Error ? error.message : "Unknown validation error",
          "",
        ),
      ],
      warnings,
    };
  }
}
