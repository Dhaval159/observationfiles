import type { EventEmitter } from "@/types/engine";
import type {
  TheoryNode,
  TheoryConnection,
  TheoryBoard,
  TheoryBoardValidationResult,
  TheoryBoardLayout,
  TheoryNodeType,
} from "@/types/theory-board";
import type {
  TheoryBoardEngineState,
  NodeCreationParams,
  ConnectionCreationParams,
} from "../types";
import { generateId } from "@/lib/utils";
import {
  createNode,
  createConnection,
  validateTheoryBoard,
  findConnectedComponent,
} from "../utils";

export class TheoryBoardEngine {
  readonly id: string;
  readonly name = "TheoryBoardEngine";

  private state: TheoryBoardEngineState;
  private emitter: EventEmitter;

  constructor(emitter: EventEmitter) {
    this.id = `theory-board-engine-${Math.random().toString(36).slice(2, 9)}`;
    this.emitter = emitter;
    this.state = {
      board: null,
      isDirty: false,
      selectedNodeId: null,
      selectedConnectionId: null,
      validationResults: [],
    };
  }

  createBoard(caseId: string, userId: string): TheoryBoard {
    const now = new Date().toISOString();
    const board: TheoryBoard = {
      id: generateId(),
      caseId,
      userId,
      nodes: [],
      connections: [],
      layout: {
        viewportX: 0,
        viewportY: 0,
        zoom: 1,
        gridVisible: true,
        snapToGrid: true,
        gridSize: 20,
        autoLayout: false,
      },
      isAutoSaved: false,
      lastSavedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    this.state.board = board;
    this.state.isDirty = true;
    this.emitter.emit("board_created", { boardId: board.id, caseId });
    return board;
  }

  loadBoard(board: TheoryBoard): void {
    this.state.board = {
      ...board,
      nodes: board.nodes.map((n) => ({ ...n })),
      connections: board.connections.map((c) => ({ ...c })),
    };
    this.state.isDirty = false;
    this.state.selectedNodeId = null;
    this.state.selectedConnectionId = null;
    this.state.validationResults = [];
    this.emitter.emit("board_loaded", { boardId: board.id });
  }

  getBoard(): TheoryBoard | null {
    return this.state.board;
  }

  addNode(params: NodeCreationParams): TheoryNode {
    if (!this.state.board) {
      throw new Error("No board loaded");
    }

    const node = createNode(params);
    this.state.board.nodes.push(node);
    this.state.isDirty = true;
    this.emitter.emit("node_added", { nodeId: node.id, boardId: this.state.board.id });
    this.emitter.emit("board_changed", { boardId: this.state.board.id });
    return node;
  }

  updateNode(nodeId: string, updates: Partial<TheoryNode>): TheoryNode | null {
    if (!this.state.board) return null;

    const index = this.state.board.nodes.findIndex((n) => n.id === nodeId);
    if (index === -1) return null;

    this.state.board.nodes[index] = {
      ...this.state.board.nodes[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    } as TheoryNode;
    this.state.isDirty = true;
    this.emitter.emit("node_updated", { nodeId, boardId: this.state.board.id });
    this.emitter.emit("board_changed", { boardId: this.state.board.id });
    return this.state.board.nodes[index] ?? null;
  }

  removeNode(nodeId: string): void {
    if (!this.state.board) return;

    this.state.board.nodes = this.state.board.nodes.filter((n) => n.id !== nodeId);
    this.state.board.connections = this.state.board.connections.filter(
      (c) => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId,
    );

    if (this.state.selectedNodeId === nodeId) {
      this.state.selectedNodeId = null;
    }

    this.state.isDirty = true;
    this.emitter.emit("node_removed", { nodeId, boardId: this.state.board.id });
    this.emitter.emit("board_changed", { boardId: this.state.board.id });
  }

  moveNode(nodeId: string, x: number, y: number): void {
    if (!this.state.board) return;

    const node = this.state.board.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    node.x = x;
    node.y = y;
    node.updatedAt = new Date().toISOString();
    this.state.isDirty = true;
    this.emitter.emit("node_moved", { nodeId, x, y });
  }

  selectNode(nodeId: string | null): void {
    this.state.selectedNodeId = nodeId;
    this.emitter.emit("node_selected", { nodeId });
  }

  getNode(nodeId: string): TheoryNode | null {
    return this.state.board?.nodes.find((n) => n.id === nodeId) ?? null;
  }

  getAllNodes(): TheoryNode[] {
    return this.state.board?.nodes ?? [];
  }

  getNodesByType(type: TheoryNodeType): TheoryNode[] {
    return this.state.board?.nodes.filter((n) => n.type === type) ?? [];
  }

  pinNode(nodeId: string): void {
    const node = this.getNode(nodeId);
    if (!node) return;
    node.isPinned = true;
    node.updatedAt = new Date().toISOString();
    this.state.isDirty = true;
    this.emitter.emit("node_pinned", { nodeId });
  }

  unpinNode(nodeId: string): void {
    const node = this.getNode(nodeId);
    if (!node) return;
    node.isPinned = false;
    node.updatedAt = new Date().toISOString();
    this.state.isDirty = true;
    this.emitter.emit("node_unpinned", { nodeId });
  }

  addConnection(params: ConnectionCreationParams): TheoryConnection {
    if (!this.state.board) {
      throw new Error("No board loaded");
    }

    const sourceExists = this.state.board.nodes.some((n) => n.id === params.sourceNodeId);
    const targetExists = this.state.board.nodes.some((n) => n.id === params.targetNodeId);
    if (!sourceExists || !targetExists) {
      throw new Error("Source or target node does not exist");
    }

    const connection = createConnection(params);
    this.state.board.connections.push(connection);
    this.state.isDirty = true;
    this.emitter.emit("connection_added", {
      connectionId: connection.id,
      boardId: this.state.board.id,
    });
    this.emitter.emit("board_changed", { boardId: this.state.board.id });
    return connection;
  }

  updateConnection(
    connectionId: string,
    updates: Partial<TheoryConnection>,
  ): TheoryConnection | null {
    if (!this.state.board) return null;

    const index = this.state.board.connections.findIndex((c) => c.id === connectionId);
    if (index === -1) return null;

    this.state.board.connections[index] = {
      ...this.state.board.connections[index],
      ...updates,
    } as TheoryConnection;
    this.state.isDirty = true;
    this.emitter.emit("connection_updated", { connectionId, boardId: this.state.board.id });
    this.emitter.emit("board_changed", { boardId: this.state.board.id });
    return this.state.board.connections[index] ?? null;
  }

  removeConnection(connectionId: string): void {
    if (!this.state.board) return;

    this.state.board.connections = this.state.board.connections.filter(
      (c) => c.id !== connectionId,
    );

    if (this.state.selectedConnectionId === connectionId) {
      this.state.selectedConnectionId = null;
    }

    this.state.isDirty = true;
    this.emitter.emit("connection_removed", { connectionId, boardId: this.state.board.id });
    this.emitter.emit("board_changed", { boardId: this.state.board.id });
  }

  selectConnection(connectionId: string | null): void {
    this.state.selectedConnectionId = connectionId;
    this.emitter.emit("connection_selected", { connectionId });
  }

  getConnection(connectionId: string): TheoryConnection | null {
    return this.state.board?.connections.find((c) => c.id === connectionId) ?? null;
  }

  getAllConnections(): TheoryConnection[] {
    return this.state.board?.connections ?? [];
  }

  getNodeConnections(nodeId: string): TheoryConnection[] {
    if (!this.state.board) return [];
    return this.state.board.connections.filter(
      (c) => c.sourceNodeId === nodeId || c.targetNodeId === nodeId,
    );
  }

  getConnectedNodes(nodeId: string): TheoryNode[] {
    if (!this.state.board) return [];

    const component = findConnectedComponent(nodeId, this.state.board.connections);
    const result: TheoryNode[] = [];

    for (const id of component) {
      if (id === nodeId) continue;
      const node = this.state.board.nodes.find((n) => n.id === id);
      if (node) result.push(node);
    }

    return result;
  }

  updateLayout(layout: Partial<TheoryBoardLayout>): void {
    if (!this.state.board) return;
    this.state.board.layout = { ...this.state.board.layout, ...layout };
    this.state.isDirty = true;
    this.emitter.emit("layout_updated", { layout: this.state.board.layout });
  }

  autoLayout(): void {
    if (!this.state.board) return;

    const nodes = this.state.board.nodes;
    if (nodes.length === 0) return;

    const cols = Math.ceil(Math.sqrt(nodes.length));
    const spacingX = 250;
    const spacingY = 150;
    const startX = 100;
    const startY = 100;

    nodes.forEach((node, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      node.x = startX + col * spacingX;
      node.y = startY + row * spacingY;
      node.updatedAt = new Date().toISOString();
    });

    this.state.isDirty = true;
    this.emitter.emit("layout_updated", { layout: this.state.board.layout });
    this.emitter.emit("board_changed", { boardId: this.state.board.id });
  }

  validate(): TheoryBoardValidationResult[] {
    if (!this.state.board) return [];

    const results = validateTheoryBoard(this.state.board);
    this.state.validationResults = results;
    this.emitter.emit("board_validated", { results });
    return results;
  }

  markNodeCorrectness(nodeId: string, isCorrect: boolean): void {
    const node = this.getNode(nodeId);
    if (!node) return;
    node.isCorrect = isCorrect;
    node.updatedAt = new Date().toISOString();
    this.state.isDirty = true;
    this.emitter.emit("node_correctness_marked", { nodeId, isCorrect });
  }

  markConnectionCorrectness(connectionId: string, isCorrect: boolean): void {
    const conn = this.getConnection(connectionId);
    if (!conn) return;
    conn.isCorrect = isCorrect;
    this.state.isDirty = true;
    this.emitter.emit("connection_correctness_marked", { connectionId, isCorrect });
  }

  clearBoard(): void {
    if (!this.state.board) return;

    this.state.board.nodes = [];
    this.state.board.connections = [];
    this.state.selectedNodeId = null;
    this.state.selectedConnectionId = null;
    this.state.validationResults = [];
    this.state.isDirty = true;
    this.emitter.emit("board_cleared", { boardId: this.state.board.id });
    this.emitter.emit("board_changed", { boardId: this.state.board.id });
  }

  getBoardProgress(): {
    nodeCount: number;
    connectionCount: number;
    correctNodes: number;
    correctConnections: number;
    totalNodes: number;
    totalConnections: number;
  } {
    if (!this.state.board) {
      return {
        nodeCount: 0,
        connectionCount: 0,
        correctNodes: 0,
        correctConnections: 0,
        totalNodes: 0,
        totalConnections: 0,
      };
    }

    const nodes = this.state.board.nodes;
    const connections = this.state.board.connections;

    return {
      nodeCount: nodes.length,
      connectionCount: connections.length,
      correctNodes: nodes.filter((n) => n.isCorrect === true).length,
      correctConnections: connections.filter((c) => c.isCorrect === true).length,
      totalNodes: nodes.length,
      totalConnections: connections.length,
    };
  }

  serialize(): string {
    return JSON.stringify(this.state.board);
  }

  deserialize(data: string): void {
    const board = JSON.parse(data) as TheoryBoard;
    this.loadBoard(board);
    this.emitter.emit("board_deserialized", { boardId: board.id });
  }

  reset(): void {
    this.state = {
      board: null,
      isDirty: false,
      selectedNodeId: null,
      selectedConnectionId: null,
      validationResults: [],
    };
    this.emitter.emit("board_reset");
  }
}
