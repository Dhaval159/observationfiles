import type { DomainEvent } from "@/domain/events/base-event";

export interface DialogueStartedEvent extends DomainEvent {
  readonly type: "DIALOGUE_STARTED";
  readonly caseId: string;
  readonly conversationId: string;
  readonly treeId: string;
  readonly npcId: string | null;
  readonly playerId: string;
}

export interface DialogueEndedEvent extends DomainEvent {
  readonly type: "DIALOGUE_ENDED";
  readonly caseId: string;
  readonly conversationId: string;
  readonly npcId: string | null;
  readonly playerId: string;
  readonly endState: string;
  readonly durationMs: number;
}

export interface NodeVisitedEvent extends DomainEvent {
  readonly type: "NODE_VISITED";
  readonly caseId: string;
  readonly conversationId: string;
  readonly nodeId: string;
  readonly nodeType: string;
  readonly speaker: string;
  readonly npcId: string | null;
  readonly playerId: string;
}

export interface ChoiceSelectedEvent extends DomainEvent {
  readonly type: "CHOICE_SELECTED";
  readonly caseId: string;
  readonly conversationId: string;
  readonly nodeId: string;
  readonly choiceId: string;
  readonly choiceType: string;
  readonly playerId: string;
}

export interface EvidencePresentedEvent extends DomainEvent {
  readonly type: "EVIDENCE_PRESENTED";
  readonly caseId: string;
  readonly conversationId: string;
  readonly evidenceId: string;
  readonly nodeId: string;
  readonly wasRelevant: boolean;
  readonly outcome: string;
  readonly npcId: string | null;
  readonly playerId: string;
}

export interface NPCStateChangedEvent extends DomainEvent {
  readonly type: "NPC_STATE_CHANGED";
  readonly caseId: string;
  readonly npcId: string;
  readonly field: string;
  readonly previousValue: number | string;
  readonly newValue: number | string;
  readonly source: string;
}

export interface ConversationInterruptedEvent extends DomainEvent {
  readonly type: "CONVERSATION_INTERRUPTED";
  readonly caseId: string;
  readonly conversationId: string;
  readonly reason: string;
  readonly playerId: string;
}

export interface TopicUnlockedEvent extends DomainEvent {
  readonly type: "TOPIC_UNLOCKED";
  readonly caseId: string;
  readonly conversationId: string;
  readonly topicId: string;
  readonly playerId: string;
}

export interface QuestionUnlockedEvent extends DomainEvent {
  readonly type: "QUESTION_UNLOCKED";
  readonly caseId: string;
  readonly conversationId: string;
  readonly questionId: string;
  readonly playerId: string;
}

export interface ContradictionDiscoveredEvent extends DomainEvent {
  readonly type: "CONTRADICTION_DISCOVERED";
  readonly caseId: string;
  readonly conversationId: string;
  readonly contradictionId: string;
  readonly statementA: string;
  readonly statementB: string;
  readonly playerId: string;
}

export type DialogueEvent =
  | DialogueStartedEvent
  | DialogueEndedEvent
  | NodeVisitedEvent
  | ChoiceSelectedEvent
  | EvidencePresentedEvent
  | NPCStateChangedEvent
  | ConversationInterruptedEvent
  | TopicUnlockedEvent
  | QuestionUnlockedEvent
  | ContradictionDiscoveredEvent;

export type DialogueEventType = DialogueEvent["type"];

export function isDialogueEvent(event: DomainEvent): event is DialogueEvent {
  return (
    event.type === "DIALOGUE_STARTED" ||
    event.type === "DIALOGUE_ENDED" ||
    event.type === "NODE_VISITED" ||
    event.type === "CHOICE_SELECTED" ||
    event.type === "EVIDENCE_PRESENTED" ||
    event.type === "NPC_STATE_CHANGED" ||
    event.type === "CONVERSATION_INTERRUPTED" ||
    event.type === "TOPIC_UNLOCKED" ||
    event.type === "QUESTION_UNLOCKED" ||
    event.type === "CONTRADICTION_DISCOVERED"
  );
}
