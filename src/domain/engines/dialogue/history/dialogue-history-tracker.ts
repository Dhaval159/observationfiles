import type { ConversationEntry, ChoiceRecord } from "../types";
import type { DomainTimestamp } from "@/domain/value-objects/timestamp";
import { now } from "@/domain/value-objects/timestamp";

export class DialogueHistoryTracker {
  recordNodeVisit(conversation: ConversationEntry, nodeId: string): void {
    if (!conversation.visitedNodeIds.includes(nodeId)) {
      conversation.visitedNodeIds.push(nodeId);
    }
  }

  recordChoice(
    conversation: ConversationEntry,
    nodeId: string,
    choiceId: string,
    npcReaction?: string,
  ): void {
    const record: ChoiceRecord = {
      nodeId,
      choiceId,
      timestamp: now(),
      npcReaction: npcReaction ?? null,
    };
    conversation.choiceHistory.push(record);
  }

  getVisitedNodes(conversation: ConversationEntry): string[] {
    return [...conversation.visitedNodeIds];
  }

  getChoiceHistory(conversation: ConversationEntry): ChoiceRecord[] {
    return [...conversation.choiceHistory];
  }

  getVisitCount(conversation: ConversationEntry, nodeId: string): number {
    return conversation.visitedNodeIds.filter((id) => id === nodeId).length;
  }

  hasVisited(conversation: ConversationEntry, nodeId: string): boolean {
    return conversation.visitedNodeIds.includes(nodeId);
  }

  getLastChoice(conversation: ConversationEntry): ChoiceRecord | null {
    const history = conversation.choiceHistory;
    return history.length > 0 ? (history[history.length - 1] ?? null) : null;
  }

  getChoicesAtNode(
    conversation: ConversationEntry,
    nodeId: string,
  ): ChoiceRecord[] {
    return conversation.choiceHistory.filter((c) => c.nodeId === nodeId);
  }

  getConversationDuration(conversation: ConversationEntry): number {
    if (!conversation.startedAt) return 0;
    const end = conversation.endedAt ?? now();
    return end.unix - conversation.startedAt.unix;
  }

  getPath(conversation: ConversationEntry): string[] {
    return conversation.choiceHistory.map((c) => `${c.nodeId}:${c.choiceId}`);
  }
}
