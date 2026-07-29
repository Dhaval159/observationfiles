import type {
  DialogueTreeDefinition,
  DialogueNodeDefinition,
  ConversationEntry,
  DialogueContext,
} from "../types";

export class DialogueCache {
  private _trees: Map<string, DialogueTreeDefinition> = new Map();
  private _nodes: Map<string, DialogueNodeDefinition> = new Map();
  private _nodeToTree: Map<string, string> = new Map();
  private _conversations: Map<string, ConversationEntry> = new Map();

  setTree(tree: DialogueTreeDefinition): void {
    this._trees.set(tree.id, tree);
    for (const [nodeId, node] of tree.nodes) {
      this._nodes.set(nodeId, node);
      this._nodeToTree.set(nodeId, tree.id);
    }
  }

  getTree(treeId: string): DialogueTreeDefinition | undefined {
    return this._trees.get(treeId);
  }

  getNode(nodeId: string): DialogueNodeDefinition | undefined {
    return this._nodes.get(nodeId);
  }

  getTreeForNode(nodeId: string): string | undefined {
    return this._nodeToTree.get(nodeId);
  }

  setConversation(conversation: ConversationEntry): void {
    this._conversations.set(conversation.id, conversation);
  }

  getConversation(conversationId: string): ConversationEntry | undefined {
    return this._conversations.get(conversationId);
  }

  removeConversation(conversationId: string): void {
    this._conversations.delete(conversationId);
  }

  getAllTrees(): DialogueTreeDefinition[] {
    return Array.from(this._trees.values());
  }

  getTreesForNPC(npcId: string): DialogueTreeDefinition[] {
    return this.getAllTrees().filter((t) => t.npcId === npcId);
  }

  removeTree(treeId: string): void {
    const tree = this._trees.get(treeId);
    if (tree) {
      for (const nodeId of tree.nodes.keys()) {
        this._nodes.delete(nodeId);
        this._nodeToTree.delete(nodeId);
      }
    }
    this._trees.delete(treeId);
  }

  syncToContext(ctx: DialogueContext): void {
    ctx.treeDefinitions.clear();
    for (const [id, tree] of this._trees) {
      ctx.treeDefinitions.set(id, tree);
    }
    ctx.conversations.clear();
    for (const [id, conv] of this._conversations) {
      ctx.conversations.set(id, conv);
    }
  }

  syncFromContext(ctx: DialogueContext): void {
    this.clear();
    for (const [, tree] of ctx.treeDefinitions) {
      this.setTree(tree);
    }
    for (const [id, conv] of ctx.conversations) {
      this._conversations.set(id, conv);
    }
  }

  clear(): void {
    this._trees.clear();
    this._nodes.clear();
    this._nodeToTree.clear();
    this._conversations.clear();
  }

  get treeCount(): number {
    return this._trees.size;
  }

  get nodeCount(): number {
    return this._nodes.size;
  }
}
