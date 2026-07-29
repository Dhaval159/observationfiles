import type { ConversationEntry, JournalEntry, JournalEntryType } from "../types";
import { generateUuid } from "@/domain/utils/id-generator";
import { now } from "@/domain/value-objects/timestamp";

export class ConversationJournal {
  addEntry(
    conversation: ConversationEntry,
    type: JournalEntryType,
    title: string,
    content: string,
    options?: {
      relatedEvidenceIds?: string[];
      relatedObservationIds?: string[];
      tags?: string[];
      isImportant?: boolean;
    },
  ): JournalEntry {
    const entry: JournalEntry = {
      id: generateUuid(),
      timestamp: now(),
      type,
      title,
      content,
      relatedNodeIds: [conversation.currentNodeId ?? ""],
      relatedEvidenceIds: options?.relatedEvidenceIds ?? [],
      relatedObservationIds: options?.relatedObservationIds ?? [],
      tags: options?.tags ?? [],
      isImportant: options?.isImportant ?? false,
    };

    conversation.journalEntries.push(entry);
    return entry;
  }

  addStatementEntry(
    conversation: ConversationEntry,
    statement: string,
    isImportant?: boolean,
  ): JournalEntry {
    return this.addEntry(conversation, "statement", "Statement", statement, {
      isImportant,
    });
  }

  addAdmissionEntry(
    conversation: ConversationEntry,
    admission: string,
    isImportant?: boolean,
  ): JournalEntry {
    return this.addEntry(conversation, "admission", "Admission", admission, {
      isImportant: isImportant ?? true,
    });
  }

  addContradictionEntry(
    conversation: ConversationEntry,
    contradiction: string,
  ): JournalEntry {
    return this.addEntry(conversation, "contradiction", "Contradiction Found", contradiction, {
      isImportant: true,
    });
  }

  addRevealedFactEntry(
    conversation: ConversationEntry,
    fact: string,
  ): JournalEntry {
    return this.addEntry(conversation, "revealed_fact", "Revealed Fact", fact, {
      isImportant: true,
    });
  }

  addTopicUnlockEntry(
    conversation: ConversationEntry,
    topicName: string,
  ): JournalEntry {
    return this.addEntry(conversation, "unlocked_topic", "Topic Unlocked",
      `New conversation topic available: ${topicName}`,
    );
  }

  addNPCReactionEntry(
    conversation: ConversationEntry,
    reaction: string,
    npcName: string,
  ): JournalEntry {
    return this.addEntry(conversation, "npc_reaction", `${npcName}'s Reaction`, reaction, {
      isImportant: true,
    });
  }

  addConversationSummary(
    conversation: ConversationEntry,
    npcName: string,
  ): JournalEntry {
    const duration = conversation.durationMs;
    const nodesVisited = conversation.visitedNodeIds.length;
    const choices = conversation.choiceHistory.length;
    const evidence = conversation.presentedEvidence.length;

    const summary = `Conversation with ${npcName} lasted ${Math.round(duration / 1000)}s. ` +
      `Visited ${nodesVisited} nodes, made ${choices} choices, presented ${evidence} evidence items.`;

    return this.addEntry(conversation, "conversation_summary", `Conversation: ${npcName}`, summary);
  }

  getEntries(conversation: ConversationEntry): JournalEntry[] {
    return [...conversation.journalEntries];
  }

  getImportantEntries(conversation: ConversationEntry): JournalEntry[] {
    return conversation.journalEntries.filter((e) => e.isImportant);
  }

  getEntriesByType(
    conversation: ConversationEntry,
    type: JournalEntryType,
  ): JournalEntry[] {
    return conversation.journalEntries.filter((e) => e.type === type);
  }

  searchEntries(
    conversation: ConversationEntry,
    query: string,
  ): JournalEntry[] {
    const q = query.toLowerCase();
    return conversation.journalEntries.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.content.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }
}
