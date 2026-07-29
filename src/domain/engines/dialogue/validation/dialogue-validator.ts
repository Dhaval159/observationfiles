import type {
  DialogueTreeDefinition,
  DialogueValidationResult,
  DialogueValidationError,
  DialogueValidationWarning,
  DialogueContext,
  DialogueNodeDefinition,
} from "../types";

export class DialogueValidator {
  validateTree(tree: DialogueTreeDefinition): DialogueValidationResult {
    const errors: DialogueValidationError[] = [];
    const warnings: DialogueValidationWarning[] = [];

    if (!tree.id || tree.id.trim().length === 0) {
      errors.push({ code: "TREE_NO_ID", message: "Tree must have an id", field: "id" });
    }

    if (!tree.rootNodeId || tree.rootNodeId.trim().length === 0) {
      errors.push({
        code: "TREE_NO_ROOT",
        message: "Tree must have a root node",
        field: "rootNodeId",
        treeId: tree.id,
      });
    }

    if (!tree.nodes.has(tree.rootNodeId)) {
      errors.push({
        code: "TREE_ROOT_NOT_FOUND",
        message: `Root node '${tree.rootNodeId}' not found`,
        field: "rootNodeId",
        treeId: tree.id,
      });
    }

    if (tree.nodes.size === 0) {
      errors.push({
        code: "TREE_NO_NODES",
        message: "Tree has no nodes",
        field: "nodes",
        treeId: tree.id,
      });
    }

    const allNodeIds = new Set<string>();
    const referencedNodeIds = new Set<string>();

    for (const [nodeId, node] of tree.nodes) {
      allNodeIds.add(nodeId);

      const nodeErrors = this.validateNode(tree, node);
      errors.push(...nodeErrors);

      if (node.nextNodeId) {
        referencedNodeIds.add(node.nextNodeId);
      }

      for (const choice of node.choices) {
        referencedNodeIds.add(choice.nextNodeId);
      }
    }

    for (const refId of referencedNodeIds) {
      if (!allNodeIds.has(refId)) {
        warnings.push({
          code: "TREE_DANGLING_REF",
          message: `Node references '${refId}' which does not exist in tree`,
          field: "nextNodeId",
          treeId: tree.id,
        });
      }
    }

    if (this._hasCycle(tree)) {
      errors.push({
        code: "TREE_CYCLE",
        message: "Circular reference detected in dialogue tree",
        field: "nodes",
        treeId: tree.id,
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  validateNode(
    tree: DialogueTreeDefinition,
    node: DialogueNodeDefinition,
  ): DialogueValidationError[] {
    const errors: DialogueValidationError[] = [];

    if (!node.id || node.id.trim().length === 0) {
      errors.push({
        code: "NODE_NO_ID",
        message: "Node must have an id",
        field: "id",
        treeId: tree.id,
      });
    }

    if (!node.text || node.text.trim().length === 0) {
      errors.push({
        code: "NODE_NO_TEXT",
        message: `Node '${node.id}' has no text`,
        field: "text",
        treeId: tree.id,
        nodeId: node.id,
      });
    }

    if (node.choices.length > 0 && node.nextNodeId) {
      errors.push({
        code: "NODE_BOTH_CHOICES_AND_NEXT",
        message: `Node '${node.id}' has both choices and nextNodeId - ambiguous flow`,
        field: "nextNodeId",
        treeId: tree.id,
        nodeId: node.id,
      });
    }

    if (!node.isEndNode && node.choices.length === 0 && !node.nextNodeId) {
      errors.push({
        code: "NODE_NO_EXIT",
        message: `Node '${node.id}' is not an end node but has no choices or next node`,
        field: "choices",
        treeId: tree.id,
        nodeId: node.id,
      });
    }

    const choiceIds = new Set<string>();
    for (const choice of node.choices) {
      if (choiceIds.has(choice.id)) {
        errors.push({
          code: "NODE_DUPLICATE_CHOICE",
          message: `Node '${node.id}' has duplicate choice '${choice.id}'`,
          field: "choices",
          treeId: tree.id,
          nodeId: node.id,
        });
      }
      choiceIds.add(choice.id);
    }

    return errors;
  }

  validateContext(ctx: DialogueContext): DialogueValidationResult {
    const errors: DialogueValidationError[] = [];
    const warnings: DialogueValidationWarning[] = [];

    for (const [, tree] of ctx.treeDefinitions) {
      const treeResult = this.validateTree(tree);
      errors.push(...treeResult.errors);
      warnings.push(...treeResult.warnings);
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  private _hasCycle(tree: DialogueTreeDefinition): boolean {
    const visited = new Set<string>();
    const stack = new Set<string>();

    function dfs(nodeId: string): boolean {
      if (stack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      stack.add(nodeId);

      const node = tree.nodes.get(nodeId);
      if (!node) {
        stack.delete(nodeId);
        return false;
      }

      if (node.nextNodeId) {
        if (dfs(node.nextNodeId)) return true;
      }

      for (const choice of node.choices) {
        if (dfs(choice.nextNodeId)) return true;
      }

      stack.delete(nodeId);
      return false;
    }

    return dfs(tree.rootNodeId);
  }
}
