import type { Result } from "../results/result";

export interface DialogueNode {
  readonly id: string;
  readonly npcId: string;
  readonly text: string;
  readonly speaker: string;
  readonly choices: DialogueChoice[];
  readonly conditions: DialogueCondition[];
  readonly actions: DialogueAction[];
  readonly nextNodeId: string | null;
  readonly isEndNode: boolean;
  readonly isStartNode: boolean;
  readonly emotion: string;
}

export interface DialogueChoice {
  readonly id: string;
  readonly text: string;
  readonly nextNodeId: string;
  readonly conditions: DialogueCondition[];
  readonly actions: DialogueAction[];
  readonly isEnabled: boolean;
  readonly tooltip: string | null;
}

export interface DialogueCondition {
  readonly type: string;
  readonly targetId: string;
  readonly operator: string;
  readonly value: unknown;
  readonly isSatisfied: boolean;
}

export interface DialogueAction {
  readonly type: string;
  readonly target: string;
  readonly value: unknown;
}

export interface IDialogueEngine {
  readonly id: string;
  readonly name: string;

  startDialogue(caseId: string, npcId: string, playerId: string): Promise<Result<DialogueNode>>;
  getCurrentNode(caseId: string, npcId: string, playerId: string): Promise<Result<DialogueNode>>;
  selectChoice(caseId: string, npcId: string, choiceId: string, playerId: string): Promise<Result<DialogueNode>>;
  canInteract(caseId: string, npcId: string, playerId: string): Promise<Result<boolean>>;
  getAvailableDialogues(caseId: string, playerId: string): Promise<Result<Array<{ npcId: string; npcName: string }>>>;
  getDialogueHistory(caseId: string, npcId: string, playerId: string): Promise<Result<DialogueNode[]>>;
  resetDialogue(caseId: string, npcId: string, playerId: string): Promise<Result<void>>;
  hasUnlockedTopics(caseId: string, npcId: string, playerId: string): Promise<Result<boolean>>;
}
