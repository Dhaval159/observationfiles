import { generateId } from "@/lib/utils";
import type {
  TheoryNode,
  TheoryConnection,
  TheoryBoard,
  TheoryBoardValidationResult,
  TheoryConnectionType,
} from "@/types/theory-board";
import type { NodeCreationParams, ConnectionCreationParams } from "../types";

export function createNode(params: NodeCreationParams): TheoryNode {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    type: params.type,
    label: params.label,
    description: params.description ?? "",
    x: params.x,
    y: params.y,
    confidence: 0.5,
    isDiscovered: false,
    isCorrect: null,
    evidenceRefs: params.evidenceRefs ?? [],
    observationRefs: params.observationRefs ?? [],
    statementRefs: params.statementRefs ?? [],
    playerNotes: "",
    color: null,
    size: "medium",
    isPinned: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function createConnection(params: ConnectionCreationParams): TheoryConnection {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    sourceNodeId: params.sourceNodeId,
    targetNodeId: params.targetNodeId,
    label: params.label ?? "",
    type: params.type ?? "relates_to",
    confidence: 0.5,
    isCorrect: null,
    isBidirectional: params.isBidirectional ?? false,
    playerNotes: "",
    color: null,
    style: "solid",
    thickness: "normal",
    createdAt: now,
  };
}

export function calculateNodeConfidence(
  node: TheoryNode,
  connections: TheoryConnection[],
  allNodes: Map<string, TheoryNode>,
): number {
  const nodeConnections = connections.filter(
    (c) => c.sourceNodeId === node.id || c.targetNodeId === node.id,
  );

  if (nodeConnections.length === 0) return node.confidence;

  let totalConfidence = 0;
  let weightSum = 0;

  for (const conn of nodeConnections) {
    const otherNodeId = conn.sourceNodeId === node.id ? conn.targetNodeId : conn.sourceNodeId;
    const otherNode = allNodes.get(otherNodeId);
    if (!otherNode) continue;

    const weight = getConnectionTypeWeight(conn.type);
    const connectedConfidence = otherNode.confidence * conn.confidence;
    totalConfidence += connectedConfidence * weight;
    weightSum += weight;
  }

  if (weightSum === 0) return node.confidence;
  return totalConfidence / weightSum;
}

function getConnectionTypeWeight(type: TheoryConnectionType): number {
  switch (type) {
    case "proves":
    case "disproves":
      return 2.0;
    case "supports":
    case "contradicts":
    case "implies":
      return 1.5;
    case "leads_to":
    case "explains":
      return 1.0;
    case "questions":
      return 0.75;
    case "relates_to":
    case "custom":
    default:
      return 0.5;
  }
}

export function findConnectedComponent(
  nodeId: string,
  connections: TheoryConnection[],
): Set<string> {
  const visited = new Set<string>();
  const stack = [nodeId];

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (visited.has(current)) continue;
    visited.add(current);

    for (const conn of connections) {
      if (conn.sourceNodeId === current && !visited.has(conn.targetNodeId)) {
        stack.push(conn.targetNodeId);
      }
      if (conn.targetNodeId === current && !visited.has(conn.sourceNodeId)) {
        stack.push(conn.sourceNodeId);
      }
      if (conn.isBidirectional) {
        if (conn.targetNodeId === current && !visited.has(conn.sourceNodeId)) {
          stack.push(conn.sourceNodeId);
        }
        if (conn.sourceNodeId === current && !visited.has(conn.targetNodeId)) {
          stack.push(conn.targetNodeId);
        }
      }
    }
  }

  return visited;
}

export function hasCycle(startNodeId: string, connections: TheoryConnection[]): boolean {
  const adjacency = new Map<string, string[]>();

  for (const conn of connections) {
    if (!adjacency.has(conn.sourceNodeId)) {
      adjacency.set(conn.sourceNodeId, []);
    }
    adjacency.get(conn.sourceNodeId)!.push(conn.targetNodeId);
    if (conn.isBidirectional) {
      if (!adjacency.has(conn.targetNodeId)) {
        adjacency.set(conn.targetNodeId, []);
      }
      adjacency.get(conn.targetNodeId)!.push(conn.sourceNodeId);
    }
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();

  function dfs(node: string): boolean {
    if (visiting.has(node)) return true;
    if (visited.has(node)) return false;

    visiting.add(node);
    const neighbors = adjacency.get(node) ?? [];
    for (const neighbor of neighbors) {
      if (dfs(neighbor)) return true;
    }
    visiting.delete(node);
    visited.add(node);
    return false;
  }

  return dfs(startNodeId);
}

export function validateTheoryBoard(board: TheoryBoard): TheoryBoardValidationResult[] {
  const results: TheoryBoardValidationResult[] = [];
  const nodeMap = new Map(board.nodes.map((n) => [n.id, n]));

  for (const node of board.nodes) {
    const nodeConns = board.connections.filter(
      (c) => c.sourceNodeId === node.id || c.targetNodeId === node.id,
    );
    if (nodeConns.length === 0) {
      results.push({
        nodeId: node.id,
        issue: "missing_connection",
        message: `Node "${node.label}" is not connected to any other nodes`,
        severity: "warning",
      });
    }
  }

  for (let i = 0; i < board.connections.length; i++) {
    for (let j = i + 1; j < board.connections.length; j++) {
      const a = board.connections[i]!;
      const b = board.connections[j]!;

      const isSamePair =
        (a.sourceNodeId === b.sourceNodeId && a.targetNodeId === b.targetNodeId) ||
        (a.sourceNodeId === b.targetNodeId && a.targetNodeId === b.sourceNodeId);

      if (!isSamePair) continue;

      if (
        (a.type === "supports" && b.type === "contradicts") ||
        (a.type === "contradicts" && b.type === "supports") ||
        (a.type === "proves" && b.type === "disproves") ||
        (a.type === "disproves" && b.type === "proves")
      ) {
        results.push({
          nodeId: a.sourceNodeId,
          connectionId: a.id,
          issue: "contradictory_connection",
          message: `Connections between "${nodeMap.get(a.sourceNodeId)?.label ?? a.sourceNodeId}" and "${nodeMap.get(a.targetNodeId)?.label ?? a.targetNodeId}" are contradictory`,
          severity: "error",
        });
      }
    }
  }

  for (const node of board.nodes) {
    if (hasCycle(node.id, board.connections)) {
      results.push({
        nodeId: node.id,
        issue: "circular_reference",
        message: `Node "${node.label}" is part of a circular reference chain`,
        severity: "error",
      });
    }
  }

  for (const node of board.nodes) {
    if (node.evidenceRefs.length === 0 && node.observationRefs.length === 0) {
      const hasEvidenceConnections = board.connections.some(
        (c) =>
          (c.sourceNodeId === node.id || c.targetNodeId === node.id) &&
          (nodeMap.get(c.sourceNodeId)?.type === "evidence" ||
            nodeMap.get(c.targetNodeId)?.type === "evidence"),
      );
      if (!hasEvidenceConnections) {
        results.push({
          nodeId: node.id,
          issue: "unlinked_evidence",
          message: `Node "${node.label}" has no evidence references or evidence connections`,
          severity: "info",
        });
      }
    }
  }

  return results;
}

export function calculateConnectionConfidence(
  source: TheoryNode,
  target: TheoryNode,
  connection: TheoryConnection,
): number {
  const baseConfidence = connection.confidence;
  const sourceConfidence = source.confidence;
  const targetConfidence = target.confidence;
  const typeWeight = getConnectionTypeWeight(connection.type);

  return (baseConfidence * 0.5 + sourceConfidence * 0.25 + targetConfidence * 0.25) * typeWeight;
}
