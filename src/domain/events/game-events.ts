import type { DomainEvent } from "./base-event";

export interface CaseLoadedEvent extends DomainEvent {
  readonly type: "CASE_LOADED";
  readonly caseId: string;
  readonly playerId: string;
}

export interface EvidenceCollectedEvent extends DomainEvent {
  readonly type: "EVIDENCE_COLLECTED";
  readonly caseId: string;
  readonly evidenceId: string;
  readonly locationId: string;
  readonly playerId: string;
  readonly evidenceType: string;
}

export interface EvidenceAnalyzedEvent extends DomainEvent {
  readonly type: "EVIDENCE_ANALYZED";
  readonly caseId: string;
  readonly evidenceId: string;
  readonly playerId: string;
  readonly analysisNotes: string;
}

export interface ObservationMadeEvent extends DomainEvent {
  readonly type: "OBSERVATION_MADE";
  readonly caseId: string;
  readonly observationId: string;
  readonly objectId: string;
  readonly locationId: string;
  readonly playerId: string;
  readonly confidenceGain: number;
}

export interface ObjectiveCompletedEvent extends DomainEvent {
  readonly type: "OBJECTIVE_COMPLETED";
  readonly caseId: string;
  readonly objectiveId: string;
  readonly playerId: string;
  readonly objectiveType: string;
}

export interface TimelineUpdatedEvent extends DomainEvent {
  readonly type: "TIMELINE_UPDATED";
  readonly caseId: string;
  readonly eventId: string;
  readonly playerId: string;
  readonly action: "added" | "updated" | "removed" | "reordered";
}

export interface TheoryChangedEvent extends DomainEvent {
  readonly type: "THEORY_CHANGED";
  readonly caseId: string;
  readonly playerId: string;
  readonly changeType: "node_added" | "node_removed" | "node_updated" | "connection_added" | "connection_removed" | "connection_updated";
  readonly entityId: string;
}

export interface HintUsedEvent extends DomainEvent {
  readonly type: "HINT_USED";
  readonly caseId: string;
  readonly hintId: string;
  readonly playerId: string;
  readonly hintLevel: string;
  readonly hintCategory: string;
}

export interface ProgressSavedEvent extends DomainEvent {
  readonly type: "PROGRESS_SAVED";
  readonly playerId: string;
  readonly saveId: string;
  readonly saveType: string;
}

export interface AchievementUnlockedEvent extends DomainEvent {
  readonly type: "ACHIEVEMENT_UNLOCKED";
  readonly playerId: string;
  readonly achievementId: string;
  readonly achievementTitle: string;
  readonly achievementRarity: string;
  readonly xpReward: number;
}

export interface CaseCompletedEvent extends DomainEvent {
  readonly type: "CASE_COMPLETED";
  readonly caseId: string;
  readonly playerId: string;
  readonly score: number;
  readonly timeSpentSeconds: number;
  readonly hintsUsed: number;
  readonly accuracy: number;
}

export interface CaseFailedEvent extends DomainEvent {
  readonly type: "CASE_FAILED";
  readonly caseId: string;
  readonly playerId: string;
  readonly reason: string;
}

export interface ContradictionFoundEvent extends DomainEvent {
  readonly type: "CONTRADICTION_FOUND";
  readonly caseId: string;
  readonly playerId: string;
  readonly contradictionId: string;
  readonly contradictionType: string;
}

export interface InterrogationCompletedEvent extends DomainEvent {
  readonly type: "INTERROGATION_COMPLETED";
  readonly caseId: string;
  readonly npcId: string;
  readonly playerId: string;
  readonly questionsAsked: number;
  readonly contradictionsFound: number;
  readonly trustLevel: number;
}

export interface LocationVisitedEvent extends DomainEvent {
  readonly type: "LOCATION_VISITED";
  readonly caseId: string;
  readonly locationId: string;
  readonly playerId: string;
}

export interface ScoreUpdatedEvent extends DomainEvent {
  readonly type: "SCORE_UPDATED";
  readonly caseId: string;
  readonly playerId: string;
  readonly pointsAwarded: number;
  readonly category: string;
  readonly totalScore: number;
}

export interface GameErrorEvent extends DomainEvent {
  readonly type: "GAME_ERROR";
  readonly errorCode: string;
  readonly errorMessage: string;
  readonly context: Record<string, unknown>;
}

export type GameEvent =
  | CaseLoadedEvent
  | EvidenceCollectedEvent
  | EvidenceAnalyzedEvent
  | ObservationMadeEvent
  | ObjectiveCompletedEvent
  | TimelineUpdatedEvent
  | TheoryChangedEvent
  | HintUsedEvent
  | ProgressSavedEvent
  | AchievementUnlockedEvent
  | CaseCompletedEvent
  | CaseFailedEvent
  | ContradictionFoundEvent
  | InterrogationCompletedEvent
  | LocationVisitedEvent
  | ScoreUpdatedEvent
  | GameErrorEvent;

export type GameEventType = GameEvent["type"];
