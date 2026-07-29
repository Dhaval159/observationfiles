import type { ValidationResult, ValidationError, ValidationWarning } from "../models/validation-result";

export interface Validator<T> {
  validate(input: T, context?: Record<string, unknown>): ValidationResult;
  supports(input: unknown): boolean;
  getValidatorId(): string;
}

export interface AsyncValidator<T> {
  validate(input: T, context?: Record<string, unknown>): Promise<ValidationResult>;
  supports(input: unknown): boolean;
  getValidatorId(): string;
}

export interface CompositeValidator<T> extends Validator<T> {
  addValidator(validator: Validator<T>): void;
  removeValidator(validatorId: string): void;
  getValidators(): Validator<T>[];
}

export function validateAll<T>(
  input: T,
  validators: Validator<T>[],
  context: Record<string, unknown> = {},
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  for (const validator of validators) {
    if (validator.supports(input)) {
      const result = validator.validate(input, context);
      errors.push(...result.errors);
      warnings.push(...result.warnings);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions: [],
    metadata: { ...context, validatorCount: validators.length },
    validatedAt: new Date().toISOString(),
  };
}

export async function validateAllAsync<T>(
  input: T,
  validators: AsyncValidator<T>[],
  context: Record<string, unknown> = {},
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  const results = await Promise.all(
    validators
      .filter((v) => v.supports(input))
      .map((v) => v.validate(input, context)),
  );

  for (const result of results) {
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions: [],
    metadata: { ...context, validatorCount: validators.length },
    validatedAt: new Date().toISOString(),
  };
}
