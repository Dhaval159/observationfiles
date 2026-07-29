import type {
  TheoryNode,
  TheoryConnection,
  TheoryBoard,
  TheoryBoardValidationResult,
  TheoryBoardLayout,
  TheoryNodeType,
  TheoryConnectionType,
} from "@/types/theory-board";

export interface TheoryBoardEngineState {
  board: TheoryBoard | null;
  isDirty: boolean;
  selectedNodeId: string | null;
  selectedConnectionId: string | null;
  validationResults: TheoryBoardValidationResult[];
}

export interface NodeCreationParams {
  type: TheoryNodeType;
  label: string;
  description?: string;
  x: number;
  y: number;
  evidenceRefs?: string[];
  observationRefs?: string[];
  statementRefs?: string[];
}

export interface ConnectionCreationParams {
  sourceNodeId: string;
  targetNodeId: string;
  label?: string;
  type?: TheoryConnectionType;
  isBidirectional?: boolean;
}

export type {
  TheoryNode,
  TheoryConnection,
  TheoryBoard,
  TheoryBoardValidationResult,
  TheoryBoardLayout,
  TheoryNodeType,
  TheoryConnectionType,
};
