export { DialogueEngine } from "./dialogue-engine";
export { DialogueManager } from "./manager";
export { ConversationLifecycle } from "./lifecycle";
export { isActiveState, isEndState, isValidTransition } from "./lifecycle/conversation-lifecycle-states";
export { createDialogueContext, touchContext } from "./context";
export { NPCStateManager } from "./npc";
export { DialogueCache } from "./cache";
export { DialogueHistoryTracker } from "./history";
export { ConversationJournal } from "./journal";
export { QuestionManager } from "./questions";
export { EvidencePresentationHandler } from "./evidence-presentation";
export { DialogueValidator } from "./validation";
export * from "./types";
export { isDialogueEvent } from "./events";
export type {
  DialogueStartedEvent,
  DialogueEndedEvent,
  NodeVisitedEvent,
  ChoiceSelectedEvent,
  EvidencePresentedEvent,
  NPCStateChangedEvent,
  ConversationInterruptedEvent,
  TopicUnlockedEvent,
  QuestionUnlockedEvent,
  ContradictionDiscoveredEvent,
  DialogueEvent,
  DialogueEventType,
} from "./events";
