import type { DialogueTree, DialogueNode } from "@/types/dialogue";
import type { ValidationResult } from "@/types/engine";

export function findNode(tree: DialogueTree, nodeId: string): DialogueNode | null {
  return tree.nodes.find((n) => n.id === nodeId) ?? null;
}

export function getBranchDepth(tree: DialogueTree, fromNodeId: string): number {
  const visited = new Set<string>();
  const stack: { nodeId: string; depth: number }[] = [{ nodeId: fromNodeId, depth: 0 }];
  let maxDepth = 0;

  while (stack.length > 0) {
    const item = stack.pop()!;
    if (visited.has(item.nodeId)) continue;
    visited.add(item.nodeId);

    if (item.depth > maxDepth) {
      maxDepth = item.depth;
    }

    const node = findNode(tree, item.nodeId);
    if (!node) continue;

    if (node.nextNodeId) {
      stack.push({ nodeId: node.nextNodeId, depth: item.depth + 1 });
    }
    for (const choice of node.choices) {
      stack.push({ nodeId: choice.nextNodeId, depth: item.depth + 1 });
    }
  }

  return maxDepth;
}

export function collectAllNodes(tree: DialogueTree): DialogueNode[] {
  return [...tree.nodes];
}

export function validateDialogueTree(tree: DialogueTree): ValidationResult {
  const errors: { code: string; message: string; path: string; severity: "error" }[] = [];
  const warnings: { code: string; message: string; path: string; severity: "warning" | "info" }[] =
    [];

  if (!tree.id) {
    errors.push({
      code: "MISSING_ID",
      message: "Tree id is required",
      path: "id",
      severity: "error",
    });
  }
  if (!tree.rootNodeId) {
    errors.push({
      code: "MISSING_ROOT",
      message: "rootNodeId is required",
      path: "rootNodeId",
      severity: "error",
    });
  }
  if (!tree.nodes || tree.nodes.length === 0) {
    errors.push({
      code: "NO_NODES",
      message: "nodes must not be empty",
      path: "nodes",
      severity: "error",
    });
  }

  const nodeIds = new Set(tree.nodes?.map((n) => n.id) ?? []);

  if (tree.rootNodeId && !nodeIds.has(tree.rootNodeId)) {
    errors.push({
      code: "INVALID_ROOT",
      message: "rootNodeId not found in nodes",
      path: "rootNodeId",
      severity: "error",
    });
  }

  const visited = new Set<string>();
  const stack: string[] = [tree.rootNodeId];

  while (stack.length > 0) {
    const nodeId = stack.pop()!;
    if (visited.has(nodeId)) {
      warnings.push({
        code: "CYCLE_DETECTED",
        message: `Cycle detected at node "${nodeId}"`,
        path: `nodes.${nodeId}`,
        severity: "warning",
      });
      continue;
    }
    visited.add(nodeId);

    const node = findNode(tree, nodeId);
    if (!node) {
      warnings.push({
        code: "DANGLING_REF",
        message: `Node "${nodeId}" not found in tree`,
        path: "nodes",
        severity: "warning",
      });
      continue;
    }

    if (node.nextNodeId) {
      if (!nodeIds.has(node.nextNodeId)) {
        warnings.push({
          code: "INVALID_NEXT",
          message: `nextNodeId "${node.nextNodeId}" in node "${nodeId}" not found`,
          path: `nodes.${nodeId}.nextNodeId`,
          severity: "warning",
        });
      }
      stack.push(node.nextNodeId);
    }

    for (const choice of node.choices) {
      if (!nodeIds.has(choice.nextNodeId)) {
        warnings.push({
          code: "INVALID_CHOICE_TARGET",
          message: `Choice "${choice.id}" in node "${nodeId}" targets non-existent node "${choice.nextNodeId}"`,
          path: `nodes.${nodeId}.choices.${choice.id}.nextNodeId`,
          severity: "warning",
        });
      }
      stack.push(choice.nextNodeId);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
