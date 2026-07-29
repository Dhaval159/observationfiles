export interface InterrogationDefinition {
  id: string;
  caseId: string;
  npcId: string;
  title: string;
  context: string;
  startingDialogueNodeId: string;
  dialogueNodes: DialogueNode[];
  availableEvidenceSlots: number;
  maxQuestions: number | null;
  timeLimit: number | null;
  unlockCondition: InterrogationUnlockCondition | null;
}

export type InterrogationUnlockCondition = {
  type:
    | "evidence_found"
    | "observation_made"
    | "previous_interrogation"
    | "location_visited"
    | "npc_met"
    | "score"
    | "custom";
  config: Record<string, unknown>;
};

export interface DialogueNode {
  id: string;
  speaker: "player" | "npc" | "system";
  text: string;
  emotion: string | null;
  nextNodeId: string | null;
  conditions: DialogueCondition[];
  choices: DialogueChoice[];
  isQuestion: boolean;
  isStatement: boolean;
  statementReference: string | null;
  onEnterActions: DialogueAction[];
  onExitActions: DialogueAction[];
}

export interface DialogueCondition {
  type:
    | "evidence_in_inventory"
    | "evidence_presented"
    | "observation_discovered"
    | "trust_level"
    | "pressure_level"
    | "npc_emotional_state"
    | "previous_choice"
    | "question_asked"
    | "contradiction_found"
    | "custom";
  target: string;
  operator: "==" | "!=" | ">=" | "<=" | ">" | "<" | "contains";
  value: unknown;
}

export interface DialogueChoice {
  id: string;
  text: string;
  nextNodeId: string;
  conditions: DialogueCondition[];
  isLocked: boolean;
  lockedReason: string | null;
  icon: string | null;
  type:
    "question" | "statement" | "present_evidence" | "accuse" | "pressure" | "sympathize" | "leave";
}

export interface DialogueAction {
  type:
    | "unlock_observation"
    | "reveal_evidence"
    | "adjust_trust"
    | "adjust_pressure"
    | "set_emotional_state"
    | "unlock_interrogation"
    | "unlock_question"
    | "complete_objective"
    | "add_score"
    | "trigger_event"
    | "custom";
  target: string;
  value: unknown;
}

export interface NPCInterrogationState {
  npcId: string;
  emotionalState: string;
  trustLevel: number;
  pressureLevel: number;
  questionsUnlocked: string[];
  questionsAsked: string[];
  contradictionsFound: string[];
  evidencePresented: string[];
  currentNodeId: string;
  visitedNodeIds: string[];
  choiceHistory: { nodeId: string; choiceId: string; timestamp: string }[];
  isComplete: boolean;
  completedAt: string | null;
}

export interface InterrogationSession {
  id: string;
  caseId: string;
  interrogationId: string;
  npcId: string;
  state: NPCInterrogationState;
  startedAt: string;
  endedAt: string | null;
  isReplaying: boolean;
  replaySpeed: number;
}
