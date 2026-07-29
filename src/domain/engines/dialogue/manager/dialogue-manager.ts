import type {
  DialogueTreeDefinition,
  DialogueNodeDefinition,
  DialogueChoiceDefinition,
  ConversationEntry,
  ConversationLifecycleState,
  ConversationLifecycleSnapshot,
  DialogueContext,
  DialogueValidationResult,
  EvidencePresentationRequest,
  EvidencePresentationResult,
  ChoiceRecord,
  NPCStateDefinition,
} from "../types";
import type { Result } from "@/domain/results/result";
import { success, failure } from "@/domain/results/result";
import { ValidationError, EngineError } from "@/domain/errors/domain-error";
import { touchContext } from "../context/dialogue-context";
import { DialogueCache } from "../cache/dialogue-cache";
import { NPCStateManager } from "../npc/npc-state-manager";
import { DialogueHistoryTracker } from "../history/dialogue-history-tracker";
import { ConversationJournal } from "../journal/conversation-journal";
import { QuestionManager } from "../questions/question-manager";
import { EvidencePresentationHandler } from "../evidence-presentation/evidence-presentation-handler";
import { DialogueValidator } from "../validation/dialogue-validator";
import { buildConditionContext, evaluateConditions } from "../conditions/condition-evaluator";
import { executeAction, executeActions } from "../actions/action-executor";
import type { ActionExecutionContext } from "../actions/action-executor";
import { generateUuid } from "@/domain/utils/id-generator";
import { now } from "@/domain/value-objects/timestamp";
import * as D from "../types";

export class DialogueManager {
  readonly id: string;
  readonly name: string;

  private readonly _cache: DialogueCache;
  private readonly _npcStateManager: NPCStateManager;
  private readonly _historyTracker: DialogueHistoryTracker;
  private readonly _journal: ConversationJournal;
  private readonly _questionManager: QuestionManager;
  private readonly _evidenceHandler: EvidencePresentationHandler;
  private readonly _validator: DialogueValidator;
  private readonly _config: D.DialogueEngineConfig;

  private _eventBus: { publish: (event: unknown) => Promise<void> } | null = null;

  constructor(config?: Partial<D.DialogueEngineConfig>) {
    this.id = "dialogue-manager";
    this.name = "Dialogue Manager";

    this._config = { ...D.DEFAULT_DIALOGUE_ENGINE_CONFIG, ...config };

    this._cache = new DialogueCache();
    this._npcStateManager = new NPCStateManager();
    this._historyTracker = new DialogueHistoryTracker();
    this._journal = new ConversationJournal();
    this._questionManager = new QuestionManager();
    this._evidenceHandler = new EvidencePresentationHandler();
    this._validator = new DialogueValidator();
  }

  get config(): Readonly<D.DialogueEngineConfig> { return this._config; }
  get cache(): DialogueCache { return this._cache; }
  get npcStateManager(): NPCStateManager { return this._npcStateManager; }
  get historyTracker(): DialogueHistoryTracker { return this._historyTracker; }
  get journal(): ConversationJournal { return this._journal; }
  get questionManager(): QuestionManager { return this._questionManager; }
  get evidenceHandler(): EvidencePresentationHandler { return this._evidenceHandler; }
  get validator(): DialogueValidator { return this._validator; }

  setEventBus(bus: { publish: (event: unknown) => Promise<void> } | null): void {
    this._eventBus = bus;
  }

  registerTree(ctx: DialogueContext, tree: D.DialogueTreeDefinition): Result<void> {
    if (this._config.validateOnRegister) {
      const validation = this._validator.validateTree(tree);
      if (!validation.isValid) {
        return failure(new ValidationError(
          `Invalid dialogue tree '${tree.id}': ${validation.errors.map((e) => e.message).join("; ")}`,
        ));
      }
    }

    ctx.treeDefinitions.set(tree.id, tree);
    this._cache.setTree(tree);

    for (const topic of tree.topics) {
      ctx.topicDefinitions.set(topic.id, topic);
    }

    for (const category of tree.categories) {
      ctx.categoryDefinitions.set(category.id, category);
    }

    touchContext(ctx);
    return success(undefined);
  }

  registerTrees(ctx: DialogueContext, trees: D.DialogueTreeDefinition[]): Result<void> {
    for (const tree of trees) {
      const result = this.registerTree(ctx, tree);
      if (!result.success) return result;
    }
    return success(undefined);
  }

  startConversation(
    ctx: DialogueContext,
    treeId: string,
    npcId: string | null,
    playerId: string,
  ): Result<ConversationEntry> {
    const tree = ctx.treeDefinitions.get(treeId);
    if (!tree) {
      return failure(new EngineError("dialogue-manager", `Tree '${treeId}' not found`));
    }

    const conversationId = generateUuid();
    const timestamp = now();

    const npcState = npcId
      ? (this._npcStateManager.getState(npcId) ?? this._npcStateManager.initialize(npcId, npcId, "unknown"))
      : null;

    const conversation: ConversationEntry = {
      id: conversationId,
      treeId,
      caseId: ctx.caseId,
      npcId,
      playerId,
      lifecycleState: "starting",
      lifecycleHistory: [],
      currentNodeId: null,
      visitedNodeIds: [],
      choiceHistory: [],
      presentedEvidence: [],
      npcState,
      journalEntries: [],
      unlockedTopics: tree.topics.filter((t) => !t.isLocked).map((t) => t.id),
      unlockedQuestions: [],
      askedQuestions: [],
      durationMs: 0,
      startedAt: timestamp,
      endedAt: null,
      interruptions: [],
      runtimeVariables: new Map(),
      flags: new Map(),
      metadata: {},
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    ctx.conversations.set(conversationId, conversation);
    ctx.currentConversationId = conversationId;
    this._cache.setConversation(conversation);

    this._transitionConversation(ctx, conversation, "starting", "startConversation");

    const rootNode = tree.nodes.get(tree.rootNodeId);
    if (rootNode) {
      this._navigateToNode(ctx, conversation, rootNode, tree);
    }

    this._transitionConversation(ctx, conversation, "active", "startConversation");
    touchContext(ctx);

    this._notifyDialogueStarted(ctx, conversation);

    return success(conversation);
  }

  resumeConversation(
    ctx: DialogueContext,
    conversationId: string,
  ): Result<ConversationEntry> {
    const conversation = ctx.conversations.get(conversationId);
    if (!conversation) {
      return failure(new EngineError("dialogue-manager", `Conversation '${conversationId}' not found`));
    }

    if (conversation.lifecycleState !== "interrupted" && conversation.lifecycleState !== "paused") {
      return failure(new EngineError("dialogue-manager", `Cannot resume conversation in state '${conversation.lifecycleState}'`));
    }

    const lastInterruption = conversation.interruptions[conversation.interruptions.length - 1];
    if (lastInterruption && !lastInterruption.wasResumed) {
      lastInterruption.wasResumed = true;
      lastInterruption.resumedAt = now();
    }

    this._transitionConversation(ctx, conversation, "active", "resumeConversation");
    ctx.currentConversationId = conversationId;
    touchContext(ctx);

    return success(conversation);
  }

  pauseConversation(
    ctx: DialogueContext,
    conversationId: string,
  ): Result<ConversationEntry> {
    const conversation = ctx.conversations.get(conversationId);
    if (!conversation) {
      return failure(new EngineError("dialogue-manager", `Conversation '${conversationId}' not found`));
    }

    this._transitionConversation(ctx, conversation, "waiting", "pauseConversation");
    touchContext(ctx);
    return success(conversation);
  }

  endConversation(
    ctx: DialogueContext,
    conversationId: string,
    endState: "completed" | "failed" | "cancelled" = "completed",
  ): Result<ConversationEntry> {
    const conversation = ctx.conversations.get(conversationId);
    if (!conversation) {
      return failure(new EngineError("dialogue-manager", `Conversation '${conversationId}' not found`));
    }

    this._transitionConversation(ctx, conversation, endState, "endConversation");
    conversation.endedAt = now();
    conversation.durationMs = conversation.startedAt
      ? conversation.endedAt.unix - conversation.startedAt.unix
      : 0;

    if (conversation.npcState) {
      this._journal.addConversationSummary(
        conversation,
        conversation.npcState.name,
      );
    }

    ctx.currentConversationId = null;
    touchContext(ctx);

    this._notifyDialogueEnded(ctx, conversation, endState);

    return success(conversation);
  }

  interruptConversation(
    ctx: DialogueContext,
    conversationId: string,
    reason: string,
  ): Result<ConversationEntry> {
    if (!this._config.allowInterruptions) {
      return failure(new EngineError("dialogue-manager", "Interruptions are disabled"));
    }

    const conversation = ctx.conversations.get(conversationId);
    if (!conversation) {
      return failure(new EngineError("dialogue-manager", `Conversation '${conversationId}' not found`));
    }

    this._transitionConversation(ctx, conversation, "interrupted", "interruptConversation");
    conversation.interruptions.push({
      timestamp: now(),
      source: "system",
      reason,
      wasResumed: false,
      resumedAt: null,
    });

    touchContext(ctx);

    this._notifyConversationInterrupted(ctx, conversation, reason);

    return success(conversation);
  }

  goToNode(
    ctx: DialogueContext,
    conversationId: string,
    nodeId: string,
  ): Result<DialogueNodeDefinition> {
    const conversation = ctx.conversations.get(conversationId);
    if (!conversation) {
      return failure(new EngineError("dialogue-manager", `Conversation '${conversationId}' not found`));
    }

    const tree = ctx.treeDefinitions.get(conversation.treeId);
    if (!tree) {
      return failure(new EngineError("dialogue-manager", `Tree '${conversation.treeId}' not found`));
    }

    const node = tree.nodes.get(nodeId);
    if (!node) {
      return failure(new EngineError("dialogue-manager", `Node '${nodeId}' not found`));
    }

    const conditionCtx = buildConditionContext(ctx);
    const npcState = conversation.npcState ?? undefined;

    if (!evaluateConditions(node.conditions, conditionCtx, npcState)) {
      return failure(new EngineError("dialogue-manager", `Conditions not met for node '${nodeId}'`));
    }

    this._navigateToNode(ctx, conversation, node, tree);
    touchContext(ctx);

    return success(node);
  }

  chooseResponse(
    ctx: DialogueContext,
    conversationId: string,
    choiceId: string,
  ): Result<{ node: DialogueNodeDefinition; choice: DialogueChoiceDefinition }> {
    const conversation = ctx.conversations.get(conversationId);
    if (!conversation) {
      return failure(new EngineError("dialogue-manager", `Conversation '${conversationId}' not found`));
    }

    const tree = ctx.treeDefinitions.get(conversation.treeId);
    if (!tree) {
      return failure(new EngineError("dialogue-manager", `Tree '${conversation.treeId}' not found`));
    }

    const currentNodeId = conversation.currentNodeId;
    if (!currentNodeId) {
      return failure(new EngineError("dialogue-manager", "No current node in conversation"));
    }

    const currentNode = tree.nodes.get(currentNodeId);
    if (!currentNode) {
      return failure(new EngineError("dialogue-manager", `Node '${currentNodeId}' not found`));
    }

    const choice = currentNode.choices.find((c) => c.id === choiceId);
    if (!choice) {
      return failure(new EngineError("dialogue-manager", `Choice '${choiceId}' not found`));
    }

    const conditionCtx = buildConditionContext(ctx);
    const npcState = conversation.npcState ?? undefined;

    if (!evaluateConditions(choice.conditions, conditionCtx, npcState)) {
      return failure(new EngineError("dialogue-manager", `Conditions not met for choice '${choiceId}'`));
    }

    this._historyTracker.recordChoice(conversation, currentNode.id, choiceId);

    const execCtx: ActionExecutionContext = {
      context: ctx,
      conversation,
      npcStateManager: this._npcStateManager,
      npcState: conversation.npcState,
    };
    executeActions(choice.actions, execCtx);

    const nextNode = tree.nodes.get(choice.nextNodeId);
    if (nextNode) {
      this._navigateToNode(ctx, conversation, nextNode, tree);
    }

    this._transitionConversation(ctx, conversation, "branching", "chooseResponse");

    this._notifyChoiceSelected(ctx, conversation, currentNode, choice);

    touchContext(ctx);

    return success({ node: nextNode ?? currentNode, choice });
  }

  presentEvidence(
    ctx: DialogueContext,
    conversationId: string,
    request: EvidencePresentationRequest,
  ): Result<EvidencePresentationResult> {
    if (!this._config.enableEvidencePresentation) {
      return failure(new EngineError("dialogue-manager", "Evidence presentation is disabled"));
    }

    const conversation = ctx.conversations.get(conversationId);
    if (!conversation) {
      return failure(new EngineError("dialogue-manager", `Conversation '${conversationId}' not found`));
    }

    const tree = ctx.treeDefinitions.get(conversation.treeId);
    if (!tree) {
      return failure(new EngineError("dialogue-manager", `Tree '${conversation.treeId}' not found`));
    }

    const currentNode: DialogueNodeDefinition | null = conversation.currentNodeId
      ? (tree.nodes.get(conversation.currentNodeId) ?? null)
      : null;

    this._transitionConversation(ctx, conversation, "presenting_evidence", "presentEvidence");

    const validationCtx = {
      collectedEvidence: [],
      relevantEvidenceMap: new Map(),
      npcReactions: new Map(),
    };

    const result = this._evidenceHandler.presentEvidence(
      conversation,
      request,
      currentNode,
      validationCtx,
    );

    if (result.journalEntry) {
      conversation.journalEntries.push(result.journalEntry);
    }

    const execCtx: ActionExecutionContext = {
      context: ctx,
      conversation,
      npcStateManager: this._npcStateManager,
      npcState: conversation.npcState,
    };

    for (const action of result.triggeredActions) {
      executeAction(action, execCtx);
    }

    this._transitionConversation(ctx, conversation, "active", "presentEvidence");

    this._notifyEvidencePresented(ctx, conversation, result);

    touchContext(ctx);
    return success(result);
  }

  unlockTopic(
    ctx: DialogueContext,
    conversationId: string,
    topicId: string,
  ): Result<void> {
    const conversation = ctx.conversations.get(conversationId);
    if (!conversation) {
      return failure(new EngineError("dialogue-manager", `Conversation '${conversationId}' not found`));
    }

    if (!conversation.unlockedTopics.includes(topicId)) {
      conversation.unlockedTopics.push(topicId);
      this._journal.addTopicUnlockEntry(conversation, topicId);
      this._notifyTopicUnlocked(ctx, conversation, topicId);
    }

    touchContext(ctx);
    return success(undefined);
  }

  lockTopic(
    ctx: DialogueContext,
    conversationId: string,
    topicId: string,
  ): Result<void> {
    const conversation = ctx.conversations.get(conversationId);
    if (!conversation) {
      return failure(new EngineError("dialogue-manager", `Conversation '${conversationId}' not found`));
    }

    const idx = conversation.unlockedTopics.indexOf(topicId);
    if (idx >= 0) {
      conversation.unlockedTopics.splice(idx, 1);
    }

    touchContext(ctx);
    return success(undefined);
  }

  getCurrentNode(
    ctx: DialogueContext,
    conversationId: string,
  ): Result<DialogueNodeDefinition> {
    const conversation = ctx.conversations.get(conversationId);
    if (!conversation) {
      return failure(new EngineError("dialogue-manager", `Conversation '${conversationId}' not found`));
    }

    if (!conversation.currentNodeId) {
      return failure(new EngineError("dialogue-manager", "No current node"));
    }

    const tree = ctx.treeDefinitions.get(conversation.treeId);
    if (!tree) {
      return failure(new EngineError("dialogue-manager", `Tree '${conversation.treeId}' not found`));
    }

    const node = tree.nodes.get(conversation.currentNodeId);
    if (!node) {
      return failure(new EngineError("dialogue-manager", `Node '${conversation.currentNodeId}' not found`));
    }

    return success(node);
  }

  getConversation(
    ctx: DialogueContext,
    conversationId: string,
  ): Result<ConversationEntry> {
    const conversation = ctx.conversations.get(conversationId);
    if (!conversation) {
      return failure(new EngineError("dialogue-manager", `Conversation '${conversationId}' not found`));
    }
    return success(conversation);
  }

  getHistory(
    ctx: DialogueContext,
    conversationId: string,
  ): Result<{ nodes: string[]; choices: ChoiceRecord[] }> {
    const conversation = ctx.conversations.get(conversationId);
    if (!conversation) {
      return failure(new EngineError("dialogue-manager", `Conversation '${conversationId}' not found`));
    }

    return success({
      nodes: this._historyTracker.getVisitedNodes(conversation),
      choices: this._historyTracker.getChoiceHistory(conversation),
    });
  }

  setNPCState(
    ctx: DialogueContext,
    npcId: string,
    name: string,
    role: string,
  ): NPCStateDefinition {
    return this._npcStateManager.initialize(npcId, name, role);
  }

  getNPCState(npcId: string): NPCStateDefinition | undefined {
    return this._npcStateManager.getState(npcId);
  }

  getAllNPCStates(): NPCStateDefinition[] {
    return this._npcStateManager.getAllStates();
  }

  validate(ctx: DialogueContext): DialogueValidationResult {
    return this._validator.validateContext(ctx);
  }

  reset(ctx: DialogueContext): void {
    this._cache.clear();
    this._npcStateManager.clearAll();
    this._evidenceHandler.clear();
    this._questionManager.clear();

    ctx.conversations.clear();
    ctx.treeDefinitions.clear();
    ctx.topicDefinitions.clear();
    ctx.categoryDefinitions.clear();
    ctx.currentConversationId = null;
    ctx.lifecycleState = "unavailable";
    ctx.runtimeVariables.clear();
    ctx.playerFlags.clear();
    ctx.temporaryCache.clear();

    touchContext(ctx);
  }

  private _navigateToNode(
    ctx: DialogueContext,
    conversation: ConversationEntry,
    node: DialogueNodeDefinition,
    _tree: DialogueTreeDefinition,
  ): void {
    conversation.currentNodeId = node.id;
    this._historyTracker.recordNodeVisit(conversation, node.id);

    const execCtx: ActionExecutionContext = {
      context: ctx,
      conversation,
      npcStateManager: this._npcStateManager,
      npcState: conversation.npcState,
    };

    executeActions(node.onEnterActions, execCtx);

    this._transitionConversation(ctx, conversation, "active", `navigateTo:${node.id}`);

    this._notifyNodeVisited(ctx, conversation, node);
  }

  private _transitionConversation(
    ctx: DialogueContext,
    conversation: ConversationEntry,
    to: ConversationLifecycleState,
    source: string,
    metadata?: Record<string, unknown>,
  ): void {
    const previousState = conversation.lifecycleState;
    const timestamp = now();

    const snapshot: ConversationLifecycleSnapshot = {
      state: to,
      previousState,
      timestamp,
      source,
      metadata,
    };

    conversation.lifecycleState = to;
    conversation.lifecycleHistory.push(snapshot);
    conversation.updatedAt = timestamp;
  }

  private async _notifyDialogueStarted(
    ctx: DialogueContext,
    conversation: ConversationEntry,
  ): Promise<void> {
    if (!this._config.enableEventSystem || !this._eventBus) return;

    await this._eventBus.publish({
      id: generateUuid(),
      type: "DIALOGUE_STARTED",
      timestamp: now(),
      source: "DialogueManager",
      caseId: ctx.caseId,
      conversationId: conversation.id,
      treeId: conversation.treeId,
      npcId: conversation.npcId,
      playerId: conversation.playerId,
    }).catch(() => {});
  }

  private async _notifyDialogueEnded(
    ctx: DialogueContext,
    conversation: ConversationEntry,
    endState: string,
  ): Promise<void> {
    if (!this._config.enableEventSystem || !this._eventBus) return;

    await this._eventBus.publish({
      id: generateUuid(),
      type: "DIALOGUE_ENDED",
      timestamp: now(),
      source: "DialogueManager",
      caseId: ctx.caseId,
      conversationId: conversation.id,
      npcId: conversation.npcId,
      playerId: conversation.playerId,
      endState,
      durationMs: conversation.durationMs,
    }).catch(() => {});
  }

  private async _notifyNodeVisited(
    ctx: DialogueContext,
    conversation: ConversationEntry,
    node: DialogueNodeDefinition,
  ): Promise<void> {
    if (!this._config.enableEventSystem || !this._eventBus) return;

    await this._eventBus.publish({
      id: generateUuid(),
      type: "NODE_VISITED",
      timestamp: now(),
      source: "DialogueManager",
      caseId: ctx.caseId,
      conversationId: conversation.id,
      nodeId: node.id,
      nodeType: node.type,
      speaker: node.speaker,
      npcId: conversation.npcId,
      playerId: conversation.playerId,
    }).catch(() => {});
  }

  private async _notifyChoiceSelected(
    ctx: DialogueContext,
    conversation: ConversationEntry,
    node: DialogueNodeDefinition,
    choice: DialogueChoiceDefinition,
  ): Promise<void> {
    if (!this._config.enableEventSystem || !this._eventBus) return;

    await this._eventBus.publish({
      id: generateUuid(),
      type: "CHOICE_SELECTED",
      timestamp: now(),
      source: "DialogueManager",
      caseId: ctx.caseId,
      conversationId: conversation.id,
      nodeId: node.id,
      choiceId: choice.id,
      choiceType: choice.type,
      playerId: conversation.playerId,
    }).catch(() => {});
  }

  private async _notifyEvidencePresented(
    ctx: DialogueContext,
    conversation: ConversationEntry,
    result: EvidencePresentationResult,
  ): Promise<void> {
    if (!this._config.enableEventSystem || !this._eventBus) return;

    await this._eventBus.publish({
      id: generateUuid(),
      type: "EVIDENCE_PRESENTED",
      timestamp: now(),
      source: "DialogueManager",
      caseId: ctx.caseId,
      conversationId: conversation.id,
      evidenceId: result.evidenceId,
      nodeId: conversation.currentNodeId ?? "",
      wasRelevant: result.isRelevant,
      outcome: result.outcome,
      npcId: conversation.npcId,
      playerId: conversation.playerId,
    }).catch(() => {});
  }

  private async _notifyConversationInterrupted(
    ctx: DialogueContext,
    conversation: ConversationEntry,
    reason: string,
  ): Promise<void> {
    if (!this._config.enableEventSystem || !this._eventBus) return;

    await this._eventBus.publish({
      id: generateUuid(),
      type: "CONVERSATION_INTERRUPTED",
      timestamp: now(),
      source: "DialogueManager",
      caseId: ctx.caseId,
      conversationId: conversation.id,
      reason,
      playerId: conversation.playerId,
    }).catch(() => {});
  }

  private async _notifyTopicUnlocked(
    ctx: DialogueContext,
    conversation: ConversationEntry,
    topicId: string,
  ): Promise<void> {
    if (!this._config.enableEventSystem || !this._eventBus) return;

    await this._eventBus.publish({
      id: generateUuid(),
      type: "TOPIC_UNLOCKED",
      timestamp: now(),
      source: "DialogueManager",
      caseId: ctx.caseId,
      conversationId: conversation.id,
      topicId,
      playerId: conversation.playerId,
    }).catch(() => {});
  }
}
