export type TheoryNodeType =
  | "suspect"
  | "evidence"
  | "observation"
  | "motive"
  | "timeline"
  | "location"
  | "relationship"
  | "theory"
  | "question"
  | "conclusion"
  | "custom";

export type TheoryConnectionType =
  | "supports"
  | "contradicts"
  | "relates_to"
  | "leads_to"
  | "proves"
  | "disproves"
  | "implies"
  | "questions"
  | "explains"
  | "custom";

export interface TheoryNode {
  id: string;
  type: TheoryNodeType;
  label: string;
  description: string;
  x: number;
  y: number;
  confidence: number;
  isDiscovered: boolean;
  isCorrect: boolean | null;
  evidenceRefs: string[];
  observationRefs: string[];
  statementRefs: string[];
  playerNotes: string;
  color: string | null;
  size: "small" | "medium" | "large";
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TheoryConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  label: string;
  type: TheoryConnectionType;
  confidence: number;
  isCorrect: boolean | null;
  isBidirectional: boolean;
  playerNotes: string;
  color: string | null;
  style: "solid" | "dashed" | "dotted";
  thickness: "thin" | "normal" | "thick";
  createdAt: string;
}

export interface TheoryBoard {
  id: string;
  caseId: string;
  userId: string;
  nodes: TheoryNode[];
  connections: TheoryConnection[];
  layout: TheoryBoardLayout;
  isAutoSaved: boolean;
  lastSavedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface TheoryBoardLayout {
  viewportX: number;
  viewportY: number;
  zoom: number;
  gridVisible: boolean;
  snapToGrid: boolean;
  gridSize: number;
  autoLayout: boolean;
}

export interface TheoryBoardValidationResult {
  nodeId: string;
  connectionId?: string;
  issue:
    | "wrong_connection"
    | "wrong_node_type"
    | "missing_connection"
    | "contradictory_connection"
    | "unlinked_evidence"
    | "circular_reference";
  message: string;
  severity: "error" | "warning" | "info";
}
