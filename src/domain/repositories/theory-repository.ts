import type { Result } from "../results/result";
import type { TheoryNode, TheoryConnection, TheoryBoard } from "../../types/theory-board";

export interface TheoryRepository {
  getBoard(caseId: string, playerId: string): Promise<Result<TheoryBoard>>;
  getNode(nodeId: string): Promise<Result<TheoryNode>>;
  getNodes(caseId: string, playerId: string): Promise<Result<TheoryNode[]>>;
  createNode(node: Omit<TheoryNode, "id" | "createdAt" | "updatedAt">): Promise<Result<TheoryNode>>;
  updateNode(nodeId: string, updates: Partial<TheoryNode>): Promise<Result<TheoryNode>>;
  deleteNode(nodeId: string): Promise<Result<void>>;
  getConnection(connectionId: string): Promise<Result<TheoryConnection>>;
  getConnections(caseId: string, playerId: string): Promise<Result<TheoryConnection[]>>;
  createConnection(connection: Omit<TheoryConnection, "id" | "createdAt">): Promise<Result<TheoryConnection>>;
  updateConnection(connectionId: string, updates: Partial<TheoryConnection>): Promise<Result<TheoryConnection>>;
  deleteConnection(connectionId: string): Promise<Result<void>>;
  saveLayout(caseId: string, playerId: string, layout: TheoryBoard["layout"]): Promise<Result<TheoryBoard["layout"]>>;
  validateBoard(caseId: string, playerId: string): Promise<Result<boolean>>;
}
