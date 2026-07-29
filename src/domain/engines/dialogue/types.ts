import type { DomainTimestamp } from "@/domain/value-objects/timestamp";
import type { Priority } from "@/domain/value-objects/priority";
import type { Requirement, RequirementSet } from "@/domain/models/unlock-condition";

export type ConversationLifecycleState =
  | "unavailable"
  | "available"
  | "starting"
  | "active"
  | "waiting"
  | "presenting_evidence"
  | "choosing_response"
  | "branching"
  | "completed"
  | "failed"
  | "interrupted"
  | "paused"
  | "cancelled"
  | "archived";

export interface ConversationLifecycleSnapshot {
  readonly state: ConversationLifecycleState;
  readonly previousState: ConversationLifecycleState;
  readonly timestamp: DomainTimestamp;
  readonly source: string;
  readonly metadata?: Record<string, unknown>;
}

export type DialogueNodeType =
  | "statement"
  | "question"
  | "choice"
  | "narration"
  | "evidence_presentation"
  | "interruption"
  | "internal_monologue"
  | "reaction"
  | "system_message"
  | "confrontation"
  | "accusation"
  | "introduction"
  | "farewell";

export type DialogueSpeaker = "player" | "npc" | "system" | "narrator";

export interface DialogueNodeDefinition {
  readonly id: string;
  readonly treeId: string;
  readonly type: DialogueNodeType;
  readonly speaker: DialogueSpeaker;
  readonly text: string;
  readonly localizationKey: string | null;
  readonly emotion: string | null;
  readonly voiceReference: string | null;
  readonly animationReference: string | null;
  readonly choices: DialogueChoiceDefinition[];
  readonly conditions: DialogueConditionDefinition[];
  readonly actions: DialogueActionDefinition[];
  readonly onEnterActions: DialogueActionDefinition[];
  readonly onExitActions: DialogueActionDefinition[];
  readonly nextNodeId: string | null;
  readonly isStartNode: boolean;
  readonly isEndNode: boolean;
  readonly tags: string[];
  readonly priority: Priority;
  readonly metadata: Record<string, unknown>;
}

export interface DialogueChoiceDefinition {
  readonly id: string;
  readonly text: string;
  readonly localizationKey: string | null;
  readonly nextNodeId: string;
  readonly type: ChoiceType;
  readonly conditions: DialogueConditionDefinition[];
  readonly actions: DialogueActionDefinition[];
  readonly icon: string | null;
  readonly tooltip: string | null;
  readonly isRepeatable: boolean;
  readonly maxUses: number;
  readonly order: number;
  readonly metadata: Record<string, unknown>;
}

export type ChoiceType =
  | "question"
  | "statement"
  | "present_evidence"
  | "accuse"
  | "pressure"
  | "sympathize"
  | "confront"
  | "leave"
  | "continue"
  | "interrupt"
  | "custom";

export interface DialogueConditionDefinition {
  readonly id: string;
  readonly type: DialogueConditionType;
  readonly targetId: string;
  readonly operator: ConditionOperator;
  readonly value: unknown;
  readonly description: string;
}

export type DialogueConditionType =
  | "evidence_collected"
  | "evidence_presented"
  | "observation_made"
  | "observation_verified"
  | "npc_state"
  | "trust_level"
  | "pressure_level"
  | "stress_level"
  | "suspicion_level"
  | "emotional_state"
  | "relationship_status"
  | "variable_value"
  | "player_flag"
  | "previous_choice"
  | "question_asked"
  | "topic_unlocked"
  | "location_visited"
  | "objective_completed"
  | "contradiction_found"
  | "time_elapsed"
  | "visit_count"
  | "custom";

export type ConditionOperator =
  | "equals"
  | "not_equals"
  | "greater_than"
  | "less_than"
  | "greater_than_or_equal"
  | "less_than_or_equal"
  | "contains"
  | "not_contains"
  | "in"
  | "not_in"
  | "exists"
  | "not_exists"
  | "between";

export interface DialogueActionDefinition {
  readonly id: string;
  readonly type: DialogueActionType;
  readonly target: string;
  readonly value: unknown;
  readonly delay: number;
  readonly metadata: Record<string, unknown>;
}

export type DialogueActionType =
  | "unlock_dialogue"
  | "lock_dialogue"
  | "unlock_topic"
  | "lock_topic"
  | "unlock_question"
  | "lock_question"
  | "unlock_evidence"
  | "unlock_observation"
  | "unlock_objective"
  | "set_variable"
  | "set_flag"
  | "adjust_trust"
  | "adjust_pressure"
  | "adjust_stress"
  | "adjust_suspicion"
  | "set_emotional_state"
  | "set_relationship_status"
  | "reveal_information"
  | "hide_information"
  | "present_evidence"
  | "record_contradiction"
  | "complete_objective"
  | "trigger_event"
  | "add_journal_entry"
  | "update_npc_state"
  | "award_points"
  | "custom";

export interface DialogueTreeDefinition {
  readonly id: string;
  readonly caseId: string;
  readonly npcId: string | null;
  readonly title: string;
  readonly description: string;
  readonly rootNodeId: string;
  readonly nodes: Map<string, DialogueNodeDefinition>;
  readonly topics: DialogueTopicDefinition[];
  readonly categories: DialogueCategoryDefinition[];
  readonly requirements: DialogueRequirementSet;
  readonly tags: string[];
  readonly priority: Priority;
  readonly isRepeatable: boolean;
  readonly maxPlays: number;
  readonly metadata: Record<string, unknown>;
}

export interface DialogueTopicDefinition {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly categoryId: string | null;
  readonly isLocked: boolean;
  readonly unlockRequirements: DialogueRequirementSet;
  readonly tags: string[];
  readonly order: number;
}

export interface DialogueCategoryDefinition {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly isLocked: boolean;
  readonly unlockRequirements: DialogueRequirementSet;
  readonly tags: string[];
  readonly order: number;
}

export interface DialogueRequirementSet {
  readonly requirements: Requirement[];
  readonly sets: RequirementSet[];
  readonly requiredCount: number;
  readonly combinator: "all" | "any" | "at_least" | "none";
}

export interface NPCStateDefinition {
  readonly npcId: string;
  readonly name: string;
  readonly role: string;
  readonly trust: number;
  readonly stress: number;
  readonly confidence: number;
  readonly mood: string;
  readonly suspicion: number;
  readonly patience: number;
  readonly cooperation: number;
  readonly fear: number;
  readonly anger: number;
  readonly respect: number;
  readonly relationship: string;
  readonly emotionalState: string;
  readonly hiddenVariables: Map<string, unknown>;
  readonly temporaryVariables: Map<string, unknown>;
  readonly persistentVariables: Map<string, unknown>;
  readonly history: NPCStateSnapshot[];
}

export interface NPCStateSnapshot {
  readonly timestamp: DomainTimestamp;
  readonly field: string;
  readonly previousValue: number | string;
  readonly newValue: number | string;
  readonly source: string;
  readonly metadata?: Record<string, unknown>;
}

export interface ConversationEntry {
  readonly id: string;
  readonly treeId: string;
  readonly caseId: string;
  readonly npcId: string | null;
  readonly playerId: string;
  lifecycleState: ConversationLifecycleState;
  lifecycleHistory: ConversationLifecycleSnapshot[];
  currentNodeId: string | null;
  visitedNodeIds: string[];
  choiceHistory: ChoiceRecord[];
  presentedEvidence: EvidencePresentationRecord[];
  readonly npcState: NPCStateDefinition | null;
  journalEntries: JournalEntry[];
  unlockedTopics: string[];
  unlockedQuestions: string[];
  askedQuestions: string[];
  durationMs: number;
  readonly startedAt: DomainTimestamp | null;
  endedAt: DomainTimestamp | null;
  interruptions: InterruptionRecord[];
  readonly runtimeVariables: Map<string, unknown>;
  readonly flags: Map<string, unknown>;
  readonly metadata: Record<string, unknown>;
  readonly createdAt: DomainTimestamp;
  updatedAt: DomainTimestamp;
}

export interface ChoiceRecord {
  readonly nodeId: string;
  readonly choiceId: string;
  readonly timestamp: DomainTimestamp;
  readonly npcReaction: string | null;
}

export interface EvidencePresentationRecord {
  readonly evidenceId: string;
  readonly nodeId: string;
  readonly timestamp: DomainTimestamp;
  readonly wasRelevant: boolean;
  readonly npcReaction: string | null;
  readonly outcome: "accepted" | "rejected" | "ignored" | "surprised" | "anger" | "fear";
}

export interface JournalEntry {
  readonly id: string;
  readonly timestamp: DomainTimestamp;
  readonly type: JournalEntryType;
  readonly title: string;
  readonly content: string;
  readonly relatedNodeIds: string[];
  readonly relatedEvidenceIds: string[];
  readonly relatedObservationIds: string[];
  readonly tags: string[];
  readonly isImportant: boolean;
}

export type JournalEntryType =
  | "statement"
  | "admission"
  | "contradiction"
  | "revealed_fact"
  | "unlocked_topic"
  | "npc_reaction"
  | "evidence_result"
  | "conversation_summary"
  | "confrontation"
  | "custom";

export interface InterruptionRecord {
  readonly timestamp: DomainTimestamp;
  readonly source: string;
  readonly reason: string;
  wasResumed: boolean;
  resumedAt: DomainTimestamp | null;
}

export interface DialogueContext {
  readonly id: string;
  readonly caseId: string;
  readonly playerId: string;

  conversations: Map<string, ConversationEntry>;
  treeDefinitions: Map<string, DialogueTreeDefinition>;
  topicDefinitions: Map<string, DialogueTopicDefinition>;
  categoryDefinitions: Map<string, DialogueCategoryDefinition>;
  npcStates: Map<string, NPCStateDefinition>;

  currentConversationId: string | null;
  lifecycleState: ConversationLifecycleState;

  runtimeVariables: Map<string, unknown>;
  playerFlags: Map<string, unknown>;
  temporaryCache: Map<string, unknown>;

  isPaused: boolean;
  isComplete: boolean;

  createdAt: DomainTimestamp;
  updatedAt: DomainTimestamp;
}

export interface EvidencePresentationRequest {
  readonly evidenceId: string;
  readonly nodeId: string;
  readonly metadata?: Record<string, unknown>;
}

export interface EvidencePresentationResult {
  readonly evidenceId: string;
  readonly isRelevant: boolean;
  readonly npcReaction: string | null;
  readonly outcome: EvidencePresentationRecord["outcome"];
  readonly unlockedNodes: string[];
  readonly triggeredActions: DialogueActionDefinition[];
  readonly journalEntry: JournalEntry | null;
}

export interface DialogueSearchCriteria {
  query?: string;
  fields?: string[];
  speaker?: DialogueSpeaker;
  nodeType?: DialogueNodeType;
  npcId?: string;
  treeId?: string;
  topicId?: string;
  categoryId?: string;
  evidenced?: boolean;
  tags?: string[];
}

export interface DialogueFilterCriteria {
  state?: ConversationLifecycleState | ConversationLifecycleState[];
  npcId?: string | string[];
  treeId?: string | string[];
  speaker?: DialogueSpeaker;
  nodeType?: DialogueNodeType | DialogueNodeType[];
  topicId?: string | string[];
  tags?: string | string[];
  hasEvidence?: boolean;
  isImportant?: boolean;
  startedAfter?: DomainTimestamp;
  startedBefore?: DomainTimestamp;
}

export interface DialogueValidationResult {
  isValid: boolean;
  errors: DialogueValidationError[];
  warnings: DialogueValidationWarning[];
}

export interface DialogueValidationError {
  readonly code: string;
  readonly message: string;
  readonly field: string;
  readonly treeId?: string;
  readonly nodeId?: string;
}

export interface DialogueValidationWarning {
  readonly code: string;
  readonly message: string;
  readonly field: string;
  readonly treeId?: string;
  readonly nodeId?: string;
}

export interface DialogueEngineConfig {
  enableAutoProgress: boolean;
  enableEventSystem: boolean;
  enableNPCStateTracking: boolean;
  enableHistoryTracking: boolean;
  enableJournal: boolean;
  enableEvidencePresentation: boolean;
  enableTopicManagement: boolean;
  enableQuestionManagement: boolean;
  enableCache: boolean;
  enablePersistence: boolean;
  validateOnRegister: boolean;
  strictValidation: boolean;
  maxHistoryEntries: number;
  maxJournalEntries: number;
  allowReplay: boolean;
  allowInterruptions: boolean;
}

export const DEFAULT_DIALOGUE_ENGINE_CONFIG: DialogueEngineConfig = {
  enableAutoProgress: true,
  enableEventSystem: true,
  enableNPCStateTracking: true,
  enableHistoryTracking: true,
  enableJournal: true,
  enableEvidencePresentation: true,
  enableTopicManagement: true,
  enableQuestionManagement: true,
  enableCache: true,
  enablePersistence: true,
  validateOnRegister: true,
  strictValidation: true,
  maxHistoryEntries: 5000,
  maxJournalEntries: 500,
  allowReplay: true,
  allowInterruptions: true,
};
