import type { ValidationError, ValidationWarning } from "@/types/engine";

export type ErrorSeverity = "low" | "medium" | "high" | "critical";

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string = "UNKNOWN_ERROR",
    statusCode: number = 500,
    details?: Record<string, unknown>,
    isOperational: boolean = true,
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.isOperational = isOperational;
  }
}

export class GameError extends AppError {
  constructor(
    message: string,
    code: string = "GAME_ERROR",
    statusCode: number = 400,
    details?: Record<string, unknown>,
  ) {
    super(message, code, statusCode, details, true);
    this.name = "GameError";
  }
}

export class ValidationGameError extends GameError {
  public readonly violations: (ValidationError | ValidationWarning)[];

  constructor(
    message: string,
    violations: (ValidationError | ValidationWarning)[] = [],
    code: string = "VALIDATION_ERROR",
    details?: Record<string, unknown>,
  ) {
    super(message, code, 422, details);
    this.name = "ValidationGameError";
    this.violations = violations;
  }
}

export function createError(
  code: string,
  message: string,
  statusCode?: number,
  details?: Record<string, unknown>,
): AppError {
  return new AppError(message, code, statusCode, details);
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function getErrorCode(error: unknown): string {
  if (isAppError(error)) return error.code;
  if (typeof error === "object" && error !== null && "code" in error) {
    return String((error as { code: unknown }).code);
  }
  return "UNKNOWN_ERROR";
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "An unknown error occurred";
  }
}

export function createErrorResponse(error: unknown): {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
} {
  const code = getErrorCode(error);
  const message = getErrorMessage(error);
  const details = isAppError(error) ? error.details : undefined;

  return {
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  };
}
