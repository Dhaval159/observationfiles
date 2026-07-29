import type { DomainEvent } from "@/domain/events/base-event";
import type { ObservationLifecycleState } from "../types";

export interface ObservationAvailableEvent extends DomainEvent {
  readonly type: "OBSERVATION_AVAILABLE";
  readonly caseId: string;
  readonly observationId: string;
  readonly locationId: string;
  readonly playerId: string;
  readonly category: string;
}

export interface ObservationStartedEvent extends DomainEvent {
  readonly type: "OBSERVATION_STARTED";
  readonly caseId: string;
  readonly observationId: string;
  readonly objectId: string;
  readonly locationId: string;
  readonly playerId: string;
}

export interface ObservationCompletedEvent extends DomainEvent {
  readonly type: "OBSERVATION_COMPLETED";
  readonly caseId: string;
  readonly observationId: string;
  readonly objectId: string;
  readonly locationId: string;
  readonly playerId: string;
  readonly confidenceGain: number;
  readonly newState: ObservationLifecycleState;
}

export interface ObservationVerifiedEvent extends DomainEvent {
  readonly type: "OBSERVATION_VERIFIED";
  readonly caseId: string;
  readonly observationId: string;
  readonly playerId: string;
  readonly confidence: number;
}

export interface ObservationRejectedEvent extends DomainEvent {
  readonly type: "OBSERVATION_REJECTED";
  readonly caseId: string;
  readonly observationId: string;
  readonly playerId: string;
  readonly reason?: string;
}

export interface ObservationUnlockedEvent extends DomainEvent {
  readonly type: "OBSERVATION_UNLOCKED";
  readonly caseId: string;
  readonly observationId: string;
  readonly playerId: string;
  readonly sourceObservationId?: string;
}

export interface ObservationHiddenEvent extends DomainEvent {
  readonly type: "OBSERVATION_HIDDEN";
  readonly caseId: string;
  readonly observationId: string;
  readonly playerId: string;
  readonly reason?: string;
}

export interface ObservationLockedEvent extends DomainEvent {
  readonly type: "OBSERVATION_LOCKED";
  readonly caseId: string;
  readonly observationId: string;
  readonly playerId: string;
  readonly reason?: string;
}

export interface ObservationArchivedEvent extends DomainEvent {
  readonly type: "OBSERVATION_ARCHIVED";
  readonly caseId: string;
  readonly observationId: string;
  readonly playerId: string;
}

export interface ObservationUpdatedEvent extends DomainEvent {
  readonly type: "OBSERVATION_UPDATED";
  readonly caseId: string;
  readonly observationId: string;
  readonly playerId: string;
  readonly changes: Record<string, unknown>;
}

export interface ObservationGroupCompletedEvent extends DomainEvent {
  readonly type: "OBSERVATION_GROUP_COMPLETED";
  readonly caseId: string;
  readonly groupId: string;
  readonly playerId: string;
  readonly completedObservations: number;
  readonly totalObservations: number;
}

export type ObservationEvent =
  | ObservationAvailableEvent
  | ObservationStartedEvent
  | ObservationCompletedEvent
  | ObservationVerifiedEvent
  | ObservationRejectedEvent
  | ObservationUnlockedEvent
  | ObservationHiddenEvent
  | ObservationLockedEvent
  | ObservationArchivedEvent
  | ObservationUpdatedEvent
  | ObservationGroupCompletedEvent;

export type ObservationEventType = ObservationEvent["type"];

export function isObservationEvent(event: DomainEvent): event is ObservationEvent {
  return event.type.startsWith("OBSERVATION_");
}
