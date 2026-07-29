import type {
  DialogueNode,
  DialogueChoice,
  DialogueCondition,
  DialogueAction,
} from "./interrogation";

export type { DialogueNode, DialogueChoice, DialogueCondition, DialogueAction };

export interface DialogueTree {
  id: string;
  caseId: string;
  npcId: string | null;
  title: string;
  description: string;
  rootNodeId: string;
  nodes: DialogueNode[];
  metadata: DialogueMetadata;
}

export interface DialogueMetadata {
  totalNodes: number;
  totalBranches: number;
  maxDepth: number;
  hasEvidencePresentation: boolean;
  hasAccusations: boolean;
  estimatedDuration: number;
}

export interface DialogueState {
  treeId: string;
  currentNodeId: string;
  visitedNodes: Set<string>;
  availableChoices: string[];
  choiceHistory: { nodeId: string; choiceId: string }[];
  isActive: boolean;
}
