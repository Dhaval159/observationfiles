import type {
  IDialogueEngine,
  DialogueNode,
  DialogueChoice,
  DialogueCondition,
  DialogueAction,
} from "../i-dialogue-engine";
import type { AsyncResult } from "@/domain/results/result";
import type {
  DialogueTreeDefinition,
  DialogueContext,
  DialogueNodeDefinition,
  ConversationEntry,
} from "./types";
import { success, failure } from "@/domain/results/result";
import { EngineError } from "@/domain/errors/domain-error";
import { DialogueManager } from "./manager";
import { createDialogueContext } from "./context";

export class DialogueEngine implements IDialogueEngine {
  readonly id: string;
  readonly name: string;

  private readonly _manager: DialogueManager;
  private readonly _contexts: Map<string, DialogueContext> = new Map();
  private readonly _npcTreeMap: Map<string, Map<string, string>> = new Map();

  constructor(config?: Partial<import("./types").DialogueEngineConfig>) {
    this.id = "dialogue-engine";
    this.name = "Dialogue Engine";
    this._manager = new DialogueManager(config);
  }

  get manager(): DialogueManager { return this._manager; }

  registerTree(tree: DialogueTreeDefinition): void {
    const ctx = this._getOrCreateContext(tree.caseId, "");
    this._manager.registerTree(ctx, tree);

    if (tree.npcId) {
      if (!this._npcTreeMap.has(tree.caseId)) {
        this._npcTreeMap.set(tree.caseId, new Map());
      }
      this._npcTreeMap.get(tree.caseId)!.set(tree.npcId, tree.id);
    }
  }

  registerTrees(trees: DialogueTreeDefinition[]): void {
    for (const tree of trees) {
      this.registerTree(tree);
    }
  }

  async startDialogue(
    caseId: string,
    npcId: string,
    playerId: string,
  ): AsyncResult<DialogueNode> {
    const ctx = this._getOrCreateContext(caseId, playerId);
    const treeId = this._resolveTreeId(caseId, npcId);

    if (!treeId) {
      return failure(new EngineError("dialogue-engine", `No dialogue tree for NPC '${npcId}' in case '${caseId}'`));
    }

    const result = this._manager.startConversation(ctx, treeId, npcId, playerId);
    if (!result.success) {
      return failure(result.error);
    }

    const nodeResult = this._manager.getCurrentNode(ctx, result.data.id);
    if (!nodeResult.success) {
      return failure(nodeResult.error);
    }

    return success(this._toInterfaceNode(nodeResult.data, npcId));
  }

  async getCurrentNode(
    caseId: string,
    npcId: string,
    _playerId: string,
  ): AsyncResult<DialogueNode> {
    const ctx = this._contexts.get(caseId);
    if (!ctx) {
      return failure(new EngineError("dialogue-engine", `No context for case '${caseId}'`));
    }

    const convEntry = this._findActiveConversation(ctx, npcId);
    if (!convEntry) {
      return failure(new EngineError("dialogue-engine", `No active conversation for NPC '${npcId}'`));
    }

    const result = this._manager.getCurrentNode(ctx, convEntry.id);
    if (!result.success) {
      return failure(result.error);
    }

    return success(this._toInterfaceNode(result.data, npcId));
  }

  async selectChoice(
    caseId: string,
    npcId: string,
    choiceId: string,
    _playerId: string,
  ): AsyncResult<DialogueNode> {
    const ctx = this._contexts.get(caseId);
    if (!ctx) {
      return failure(new EngineError("dialogue-engine", `No context for case '${caseId}'`));
    }

    const convEntry = this._findActiveConversation(ctx, npcId);
    if (!convEntry) {
      return failure(new EngineError("dialogue-engine", `No active conversation for NPC '${npcId}'`));
    }

    const result = this._manager.chooseResponse(ctx, convEntry.id, choiceId);
    if (!result.success) {
      return failure(result.error);
    }

    return success(this._toInterfaceNode(result.data.node, npcId));
  }

  canInteract(
    caseId: string,
    npcId: string,
    _playerId: string,
  ): AsyncResult<boolean> {
    const treeId = this._resolveTreeId(caseId, npcId);
    if (!treeId) return Promise.resolve(success(false));

    const ctx = this._contexts.get(caseId);
    if (!ctx) return Promise.resolve(success(false));

    const tree = ctx.treeDefinitions.get(treeId);
    if (!tree) return Promise.resolve(success(false));

    const activeConv = this._findActiveConversation(ctx, npcId);
    if (activeConv) return Promise.resolve(success(true));

    return Promise.resolve(success(true));
  }

  async getAvailableDialogues(
    caseId: string,
    _playerId: string,
  ): AsyncResult<Array<{ npcId: string; npcName: string }>> {
    const ctx = this._contexts.get(caseId);
    if (!ctx) return success([]);

    const caseNpcMap = this._npcTreeMap.get(caseId);
    if (!caseNpcMap) return success([]);

    const result: Array<{ npcId: string; npcName: string }> = [];
    for (const [npcId, treeId] of caseNpcMap) {
      const tree = ctx.treeDefinitions.get(treeId);
      if (tree) {
        const npcState = this._manager.getNPCState(npcId);
        result.push({
          npcId,
          npcName: npcState?.name ?? tree.title,
        });
      }
    }

    return success(result);
  }

  async getDialogueHistory(
    caseId: string,
    npcId: string,
    _playerId: string,
  ): AsyncResult<DialogueNode[]> {
    const ctx = this._contexts.get(caseId);
    if (!ctx) return success([]);

    const treeId = this._resolveTreeId(caseId, npcId);
    if (!treeId) return success([]);

    const tree = ctx.treeDefinitions.get(treeId);
    if (!tree) return success([]);

    const conversations = Array.from(ctx.conversations.values()).filter(
      (c) => c.npcId === npcId,
    );

    const visitedNodeIds = new Set<string>();
    for (const conv of conversations) {
      for (const nodeId of conv.visitedNodeIds) {
        visitedNodeIds.add(nodeId);
      }
    }

    return success(
      Array.from(visitedNodeIds)
        .map((nodeId) => {
          const node = tree.nodes.get(nodeId);
          return node ? this._toInterfaceNode(node, npcId) : null;
        })
        .filter((n): n is DialogueNode => n !== null),
    );
  }

  async resetDialogue(
    caseId: string,
    npcId: string,
    _playerId: string,
  ): AsyncResult<void> {
    const ctx = this._contexts.get(caseId);
    if (!ctx) return success(undefined);

    const conversations = Array.from(ctx.conversations.entries()).filter(
      ([, c]) => c.npcId === npcId,
    );

    for (const [id] of conversations) {
      ctx.conversations.delete(id);
    }

    this._manager.npcStateManager.reset(npcId);

    return success(undefined);
  }

  async hasUnlockedTopics(
    caseId: string,
    npcId: string,
    _playerId: string,
  ): AsyncResult<boolean> {
    const ctx = this._contexts.get(caseId);
    if (!ctx) return success(false);

    const convEntry = this._findConversation(ctx, npcId);
    if (!convEntry) return success(false);

    return success(convEntry.unlockedTopics.length > 0);
  }

  async endDialogue(
    caseId: string,
    npcId: string,
    _playerId: string,
    endState: "completed" | "failed" | "cancelled" = "completed",
  ): AsyncResult<void> {
    const ctx = this._contexts.get(caseId);
    if (!ctx) return success(undefined);

    const convEntry = this._findActiveConversation(ctx, npcId);
    if (!convEntry) return success(undefined);

    const result = this._manager.endConversation(ctx, convEntry.id, endState);
    if (!result.success) return failure(result.error);

    return success(undefined);
  }

  async presentEvidence(
    caseId: string,
    npcId: string,
    _playerId: string,
    evidenceId: string,
  ): AsyncResult<import("./types").EvidencePresentationResult> {
    const ctx = this._contexts.get(caseId);
    if (!ctx) {
      return failure(new EngineError("dialogue-engine", `No context for case '${caseId}'`));
    }

    const convEntry = this._findActiveConversation(ctx, npcId);
    if (!convEntry) {
      return failure(new EngineError("dialogue-engine", `No active conversation for NPC '${npcId}'`));
    }

    return this._manager.presentEvidence(ctx, convEntry.id, {
      evidenceId,
      nodeId: convEntry.currentNodeId ?? "",
    });
  }

  getNPCState(npcId: string): import("./types").NPCStateDefinition | undefined {
    return this._manager.getNPCState(npcId);
  }

  getAllNPCs(): import("./types").NPCStateDefinition[] {
    return this._manager.getAllNPCStates();
  }

  validate(caseId: string): import("./types").DialogueValidationResult {
    const ctx = this._contexts.get(caseId);
    if (!ctx) {
      return { isValid: false, errors: [{ code: "NO_CONTEXT", message: `No context for case '${caseId}'`, field: "caseId" }], warnings: [] };
    }
    return this._manager.validate(ctx);
  }

  reset(caseId: string): void {
    const ctx = this._contexts.get(caseId);
    if (ctx) {
      this._manager.reset(ctx);
    }
  }

  resetAll(): void {
    for (const [, ctx] of this._contexts) {
      this._manager.reset(ctx);
    }
    this._contexts.clear();
    this._npcTreeMap.clear();
  }

  serialize(): string {
    const data: Record<string, unknown> = {};
    for (const [caseId, ctx] of this._contexts) {
      const conversations = Array.from(ctx.conversations.entries());
      data[caseId] = {
        treeIds: Array.from(ctx.treeDefinitions.keys()),
        conversations: conversations.map(([, c]) => ({
          id: c.id,
          treeId: c.treeId,
          npcId: c.npcId,
          lifecycleState: c.lifecycleState,
          currentNodeId: c.currentNodeId,
          visitedNodeIds: c.visitedNodeIds,
          choiceHistory: c.choiceHistory,
          unlockedTopics: c.unlockedTopics,
          unlockedQuestions: c.unlockedQuestions,
        })),
      };
    }
    return JSON.stringify(data);
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data) as Record<string, Record<string, unknown>>;
    for (const [caseId, caseData] of Object.entries(parsed)) {
      const ctx = this._getOrCreateContext(caseId, "");
      const conversations = (caseData.conversations as Array<{
        id: string;
        treeId: string;
        npcId: string;
        lifecycleState: import("./types").ConversationLifecycleState;
        currentNodeId: string;
        visitedNodeIds: string[];
        choiceHistory: import("./types").ChoiceRecord[];
        unlockedTopics: string[];
        unlockedQuestions: string[];
      }>) ?? [];

      for (const c of conversations) {
        const tree = ctx.treeDefinitions.get(c.treeId);
        if (!tree) continue;

        const npcState = c.npcId ? this._manager.getNPCState(c.npcId) : null;

        const timestamp = { value: new Date(), iso: new Date().toISOString(), unix: Date.now(),
          isBefore: () => false, isAfter: () => false, isBetween: () => false,
          differenceInSeconds: () => 0, differenceInMinutes: () => 0,
          addSeconds: () => timestamp, addMinutes: () => timestamp,
          toISOString: () => "", equals: () => false };

        const entry: ConversationEntry = {
          id: c.id,
          treeId: c.treeId,
          caseId,
          npcId: c.npcId,
          playerId: "",
          lifecycleState: c.lifecycleState,
          lifecycleHistory: [],
          currentNodeId: c.currentNodeId,
          visitedNodeIds: c.visitedNodeIds,
          choiceHistory: c.choiceHistory,
          presentedEvidence: [],
          npcState: npcState ?? null,
          journalEntries: [],
          unlockedTopics: c.unlockedTopics,
          unlockedQuestions: c.unlockedQuestions,
          askedQuestions: [],
          durationMs: 0,
          startedAt: null,
          endedAt: null,
          interruptions: [],
          runtimeVariables: new Map(),
          flags: new Map(),
          metadata: {},
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        ctx.conversations.set(c.id, entry);
      }
    }
  }

  private _getOrCreateContext(caseId: string, playerId: string): DialogueContext {
    let ctx = this._contexts.get(caseId);
    if (!ctx) {
      ctx = createDialogueContext(`dialogue-${caseId}`, caseId, playerId);
      this._contexts.set(caseId, ctx);
    }
    return ctx;
  }

  private _resolveTreeId(caseId: string, npcId: string): string | null {
    return this._npcTreeMap.get(caseId)?.get(npcId) ?? null;
  }

  private _findConversation(
    ctx: DialogueContext,
    npcId: string,
  ): ConversationEntry | null {
    for (const [, conv] of ctx.conversations) {
      if (conv.npcId === npcId) return conv;
    }
    return null;
  }

  private _findActiveConversation(
    ctx: DialogueContext,
    npcId: string,
  ): ConversationEntry | null {
    for (const [, conv] of ctx.conversations) {
      if (conv.npcId === npcId) {
        const state = conv.lifecycleState;
        if (
          state === "active" ||
          state === "waiting" ||
          state === "choosing_response" ||
          state === "branching" ||
          state === "presenting_evidence"
        ) {
          return conv;
        }
      }
    }
    return null;
  }

  private _toInterfaceNode(
    node: DialogueNodeDefinition,
    npcId: string,
  ): DialogueNode {
    return {
      id: node.id,
      npcId,
      text: node.text,
      speaker: node.speaker,
      choices: node.choices.map(
        (c): DialogueChoice => ({
          id: c.id,
          text: c.text,
          nextNodeId: c.nextNodeId,
          conditions: c.conditions.map(
            (cond): DialogueCondition => ({
              type: cond.type,
              targetId: cond.targetId,
              operator: cond.operator,
              value: cond.value,
              isSatisfied: false,
            }),
          ),
          actions: c.actions.map(
            (a): DialogueAction => ({
              type: a.type,
              target: a.target,
              value: a.value,
            }),
          ),
          isEnabled: c.conditions.length === 0,
          tooltip: c.tooltip,
        }),
      ),
      conditions: node.conditions.map(
        (cond): DialogueCondition => ({
          type: cond.type,
          targetId: cond.targetId,
          operator: cond.operator,
          value: cond.value,
          isSatisfied: false,
        }),
      ),
      actions: node.actions.map(
        (a): DialogueAction => ({
          type: a.type,
          target: a.target,
          value: a.value,
        }),
      ),
      nextNodeId: node.nextNodeId,
      isEndNode: node.isEndNode,
      isStartNode: node.isStartNode,
      emotion: node.emotion ?? "neutral",
    };
  }
}
