export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: ValidationError[];
  readonly warnings: ValidationWarning[];
  readonly suggestions: ValidationSuggestion[];
  readonly metadata: Record<string, unknown>;
  readonly validatedAt: string;
}

export interface ValidationError {
  readonly code: string;
  readonly message: string;
  readonly field: string;
  readonly path: string;
  readonly severity: "error";
  readonly details: Record<string, unknown> | null;
}

export interface ValidationWarning {
  readonly code: string;
  readonly message: string;
  readonly field: string;
  readonly path: string;
  readonly severity: "warning" | "info";
  readonly details: Record<string, unknown> | null;
}

export interface ValidationSuggestion {
  readonly message: string;
  readonly action: string;
  readonly field: string;
  readonly autoFix: boolean;
}

export function createValidationResult(
  errors: ValidationError[] = [],
  warnings: ValidationWarning[] = [],
  suggestions: ValidationSuggestion[] = [],
  metadata: Record<string, unknown> = {},
): ValidationResult {
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
    metadata,
    validatedAt: new Date().toISOString(),
  };
}

export function createValidationError(
  code: string,
  message: string,
  field: string,
  path: string,
  details: Record<string, unknown> | null = null,
): ValidationError {
  return { code, message, field, path, severity: "error", details };
}

export function createValidationWarning(
  code: string,
  message: string,
  field: string,
  path: string,
  severity: "warning" | "info" = "warning",
  details: Record<string, unknown> | null = null,
): ValidationWarning {
  return { code, message, field, path, severity, details };
}
