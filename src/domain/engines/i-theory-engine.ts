import type { Result } from "../results/result";
import type { TheoryNode, TheoryConnection, TheoryBoard, TheoryBoardValidationResult } from "../../types/theory-board";

export interface ITheoryEngine {
  readonly id: string;
  readonly name: string;

  getBoard(caseId: string, playerId: string): Promise<Result<TheoryBoard>>;
  getNodes(caseId: string, playerId: string): Promise<Result<TheoryNode[]>>;
  getNode(nodeId: string): Promise<Result<TheoryNode>>;
  createNode(caseId: string, node: Omit<TheoryNode, "id" | "createdAt" | "updatedAt">, playerId: string): Promise<Result<TheoryNode>>;
  updateNode(nodeId: string, updates: Partial<TheoryNode>, playerId: string): Promise<Result<TheoryNode>>;
  deleteNode(nodeId: string, playerId: string): Promise<Result<void>>;
  getConnections(caseId: string, playerId: string): Promise<Result<TheoryConnection[]>>;
  createConnection(caseId: string, connection: Omit<TheoryConnection, "id" | "createdAt">, playerId: string): Promise<Result<TheoryConnection>>;
  updateConnection(connectionId: string, updates: Partial<TheoryConnection>, playerId: string): Promise<Result<TheoryConnection>>;
  deleteConnection(connectionId: string, playerId: string): Promise<Result<void>>;
  validateBoard(caseId: string, playerId: string): Promise<Result<TheoryBoardValidationResult[]>>;
  getSuggestedConnections(caseId: string, playerId: string): Promise<Result<Array<{ source: string; target: string; type: string }>>>;
  autoLayout(caseId: string, playerId: string): Promise<Result<TheoryNode[]>>;
  getNodeSuggestions(caseId: string, playerId: string): Promise<Result<TheoryNode[]>>;
  exportBoard(caseId: string, playerId: string): Promise<Result<string>>;
  importBoard(caseId: string, data: string, playerId: string): Promise<Result<TheoryBoard>>;
}
