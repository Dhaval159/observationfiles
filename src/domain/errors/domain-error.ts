import type { DomainErrorCode } from "./error-codes";

export interface DomainErrorDetails {
  entityType?: string;
  entityId?: string;
  operation?: string;
  constraint?: string;
  metadata?: Record<string, unknown>;
}

export class DomainError extends Error {
  public readonly code: DomainErrorCode;
  public readonly details: DomainErrorDetails;
  public readonly timestamp: string;
  public readonly isDomainError = true as const;

  constructor(code: DomainErrorCode, message: string, details: DomainErrorDetails = {}) {
    super(message);
    this.name = "DomainError";
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

export class CaseNotFoundError extends DomainError {
  constructor(caseId: string) {
    super("CASE_NOT_FOUND", `Case with id '${caseId}' not found`, {
      entityType: "Case",
      entityId: caseId,
    });
    this.name = "CaseNotFoundError";
  }
}

export class CaseLockedError extends DomainError {
  constructor(caseId: string) {
    super("CASE_LOCKED", `Case '${caseId}' is locked`, {
      entityType: "Case",
      entityId: caseId,
      constraint: "locked",
    });
    this.name = "CaseLockedError";
  }
}

export class EvidenceNotFoundError extends DomainError {
  constructor(evidenceId: string) {
    super("EVIDENCE_NOT_FOUND", `Evidence with id '${evidenceId}' not found`, {
      entityType: "Evidence",
      entityId: evidenceId,
    });
    this.name = "EvidenceNotFoundError";
  }
}

export class EvidenceAlreadyCollectedError extends DomainError {
  constructor(evidenceId: string) {
    super("EVIDENCE_ALREADY_COLLECTED", `Evidence '${evidenceId}' has already been collected`, {
      entityType: "Evidence",
      entityId: evidenceId,
    });
    this.name = "EvidenceAlreadyCollectedError";
  }
}

export class ObservationNotFoundError extends DomainError {
  constructor(observationId: string) {
    super("OBSERVATION_NOT_FOUND", `Observation with id '${observationId}' not found`, {
      entityType: "Observation",
      entityId: observationId,
    });
    this.name = "ObservationNotFoundError";
  }
}

export class ObservationAlreadyMadeError extends DomainError {
  constructor(observationId: string) {
    super("OBSERVATION_ALREADY_MADE", `Observation '${observationId}' has already been made`, {
      entityType: "Observation",
      entityId: observationId,
    });
    this.name = "ObservationAlreadyMadeError";
  }
}

export class RequirementNotMetError extends DomainError {
  constructor(entityType: string, entityId: string, requirement: string) {
    super("REQUIREMENT_NOT_MET", `Requirement '${requirement}' not met for ${entityType} '${entityId}'`, {
      entityType,
      entityId,
      constraint: requirement,
    });
    this.name = "RequirementNotMetError";
  }
}

export class TimelineConflictError extends DomainError {
  constructor(eventA: string, eventB: string, detail: string) {
    super("TIMELINE_CONFLICT", `Timeline conflict between '${eventA}' and '${eventB}': ${detail}`, {
      entityType: "TimelineEvent",
      metadata: { eventA, eventB, detail },
    });
    this.name = "TimelineConflictError";
  }
}

export class TimelineEventNotFoundError extends DomainError {
  constructor(eventId: string) {
    super("TIMELINE_EVENT_NOT_FOUND", `Timeline event with id '${eventId}' not found`, {
      entityType: "TimelineEvent",
      entityId: eventId,
    });
    this.name = "TimelineEventNotFoundError";
  }
}

export class InvalidTheoryConnectionError extends DomainError {
  constructor(sourceId: string, targetId: string, reason: string) {
    super("INVALID_THEORY_CONNECTION", `Invalid theory connection from '${sourceId}' to '${targetId}': ${reason}`, {
      entityType: "TheoryConnection",
      metadata: { sourceId, targetId, reason },
    });
    this.name = "InvalidTheoryConnectionError";
  }
}

export class InvalidProgressError extends DomainError {
  constructor(message: string, details: DomainErrorDetails = {}) {
    super("INVALID_PROGRESS", message, details);
    this.name = "InvalidProgressError";
  }
}

export class SaveNotFoundError extends DomainError {
  constructor(saveId: string) {
    super("SAVE_NOT_FOUND", `Save with id '${saveId}' not found`, {
      entityType: "SaveData",
      entityId: saveId,
    });
    this.name = "SaveNotFoundError";
  }
}

export class SaveConflictError extends DomainError {
  constructor(saveId: string, detail: string) {
    super("SAVE_CONFLICT", `Save conflict for '${saveId}': ${detail}`, {
      entityType: "SaveData",
      entityId: saveId,
      metadata: { detail },
    });
    this.name = "SaveConflictError";
  }
}

export class SaveCorruptedError extends DomainError {
  constructor(saveId: string, detail?: string) {
    super("SAVE_CORRUPTED", `Save '${saveId}' is corrupted${detail ? `: ${detail}` : ""}`, {
      entityType: "SaveData",
      entityId: saveId,
    });
    this.name = "SaveCorruptedError";
  }
}

export class ValidationError extends DomainError {
  public readonly fieldErrors: Record<string, string[]>;

  constructor(message: string, fieldErrors: Record<string, string[]> = {}, details: DomainErrorDetails = {}) {
    super("VALIDATION_FAILED", message, details);
    this.name = "ValidationError";
    this.fieldErrors = fieldErrors;
  }
}

export class DuplicateEvidenceError extends DomainError {
  constructor(evidenceId: string) {
    super("DUPLICATE_ENTITY", `Evidence '${evidenceId}' already exists`, {
      entityType: "Evidence",
      entityId: evidenceId,
    });
    this.name = "DuplicateEvidenceError";
  }
}

export class RepositoryError extends DomainError {
  constructor(message: string, details: DomainErrorDetails = {}) {
    super("REPOSITORY_ERROR", message, details);
    this.name = "RepositoryError";
  }
}

export class SerializationError extends DomainError {
  constructor(message: string, details: DomainErrorDetails = {}) {
    super("SERIALIZATION_ERROR", message, details);
    this.name = "SerializationError";
  }
}

export class EngineError extends DomainError {
  constructor(engineId: string, message: string) {
    super("ENGINE_ERROR", `Engine '${engineId}' error: ${message}`, {
      entityType: "Engine",
      entityId: engineId,
    });
    this.name = "EngineError";
  }
}
