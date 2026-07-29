import type {
  DialogueContext,
  ConversationEntry,
  EvidencePresentationRequest,
  EvidencePresentationResult,
  DialogueNodeDefinition,
  DialogueActionDefinition,
  JournalEntry,
} from "../types";
import { now } from "@/domain/value-objects/timestamp";
import { generateUuid } from "@/domain/utils/id-generator";

export interface EvidenceValidationContext {
  collectedEvidence: string[];
  relevantEvidenceMap: Map<string, string[]>;
  npcReactions: Map<string, Record<string, string>>;
}

export class EvidencePresentationHandler {
  private _relevantMap: Map<string, Map<string, string[]>> = new Map();
  private _reactionMap: Map<string, Map<string, Record<string, string>>> = new Map();

  registerRelevance(
    treeId: string,
    nodeId: string,
    evidenceIds: string[],
  ): void {
    if (!this._relevantMap.has(treeId)) {
      this._relevantMap.set(treeId, new Map());
    }
    this._relevantMap.get(treeId)!.set(nodeId, evidenceIds);
  }

  registerReaction(
    treeId: string,
    nodeId: string,
    evidenceId: string,
    reaction: string,
    outcome: string,
  ): void {
    if (!this._reactionMap.has(treeId)) {
      this._reactionMap.set(treeId, new Map());
    }
    if (!this._reactionMap.get(treeId)!.has(nodeId)) {
      this._reactionMap.get(treeId)!.set(nodeId, {});
    }
    this._reactionMap.get(treeId)!.get(nodeId)![evidenceId] = `${reaction}||${outcome}`;
  }

  presentEvidence(
    conversation: ConversationEntry,
    request: EvidencePresentationRequest,
    currentNode: DialogueNodeDefinition | null,
    validationCtx: EvidenceValidationContext,
  ): EvidencePresentationResult {
    const evidenceId = request.evidenceId;
    const nodeId = currentNode?.id ?? request.nodeId;

    const treeRelevance = this._relevantMap.get(conversation.treeId);
    const nodeRelevant = treeRelevance?.get(nodeId) ?? [];
    const isRelevant = nodeRelevant.includes(evidenceId);

    const treeReactions = this._reactionMap.get(conversation.treeId);
    const nodeReactions = treeReactions?.get(nodeId) ?? {};
    const reactionData = nodeReactions[evidenceId] ?? "";
    const [npcReaction, outcomeStr] = reactionData.split("||");

    const outcome: EvidencePresentationResult["outcome"] = isRelevant
      ? (outcomeStr as EvidencePresentationResult["outcome"]) || "accepted"
      : "rejected";

    conversation.presentedEvidence.push({
      evidenceId,
      nodeId,
      timestamp: now(),
      wasRelevant: isRelevant,
      npcReaction: npcReaction || null,
      outcome,
    });

    const unlockedNodes: string[] = [];
    const triggeredActions: DialogueActionDefinition[] = [];

    if (isRelevant) {
      const action: DialogueActionDefinition = {
        id: generateUuid(),
        type: "unlock_observation",
        target: `evidence_${evidenceId}_revealed`,
        value: true,
        delay: 0,
        metadata: { source: "evidence_presentation" },
      };
      triggeredActions.push(action);
    }

    const journalEntry: JournalEntry | null = {
      id: generateUuid(),
      timestamp: now(),
      type: outcome === "accepted" ? "evidence_result" : "statement",
      title: `Evidence ${isRelevant ? "Presented" : "Rejected"}`,
      content: `Presented evidence ${evidenceId} at node ${nodeId}. Outcome: ${outcome}`,
      relatedNodeIds: [nodeId],
      relatedEvidenceIds: [evidenceId],
      relatedObservationIds: [],
      tags: ["evidence_presentation"],
      isImportant: isRelevant,
    };

    return {
      evidenceId,
      isRelevant,
      npcReaction: npcReaction || null,
      outcome,
      unlockedNodes,
      triggeredActions,
      journalEntry,
    };
  }

  clear(): void {
    this._relevantMap.clear();
    this._reactionMap.clear();
  }
}
