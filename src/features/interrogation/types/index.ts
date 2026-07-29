import type {
  InterrogationDefinition,
  DialogueNode,
  DialogueChoice,
  DialogueAction,
  NPCInterrogationState,
  InterrogationSession,
} from "@/types/interrogation";

export interface InterrogationEngineState {
  sessions: Map<string, InterrogationSession>;
  currentSession: InterrogationSession | null;
  definitions: Map<string, InterrogationDefinition>;
}

export interface ChoiceEvaluation {
  choice: DialogueChoice;
  isAvailable: boolean;
  lockedReason: string | null;
}

export interface NodeEvaluation {
  node: DialogueNode;
  choices: ChoiceEvaluation[];
  npcEmotion: string | null;
  playerActions: DialogueAction[];
}

export type {
  InterrogationDefinition,
  DialogueNode,
  DialogueChoice,
  DialogueAction,
  NPCInterrogationState,
  InterrogationSession,
};
