import { useCallback, useMemo } from "react";
import { DialogueEngine } from "@/domain/engines/dialogue/dialogue-engine";
import { useEngineDialogueStore } from "@/stores/engine-dialogue-store";
import type { DialogueNode } from "@/domain/engines/i-dialogue-engine";
import type { NPCStateDefinition } from "@/domain/engines/dialogue/types";

import { poisonedPinotCase } from "../../cases/data/poisoned-pinot";

let engineInstance: DialogueEngine | null = null;

function getEngine(): DialogueEngine {
  if (!engineInstance) {
    engineInstance = new DialogueEngine();
    // Seed dialogue trees
    engineInstance.registerTrees(poisonedPinotCase.dialogueTrees);
  }
  return engineInstance;
}

export function useDialogueEngine(): DialogueEngine {
  return useMemo(() => getEngine(), []);
}

export function useConversation(params: { caseId: string; npcId: string; playerId: string }): {
  start: () => Promise<void>;
  end: (endState?: "completed" | "failed" | "cancelled") => Promise<void>;
  currentNode: DialogueNode | null;
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
} {
  const engine = useMemo(() => getEngine(), []);
  const store = useEngineDialogueStore();

  const start = useCallback(async () => {
    store.setLoading(true);
    store.setError(null);
    store.setCurrentCaseId(params.caseId);
    store.setCurrentPlayerId(params.playerId);
    const result = await engine.startDialogue(params.caseId, params.npcId, params.playerId);
    if (result.success) {
      store.setCurrentNode(result.data);
      store.setCurrentNpcId(params.npcId);
      store.setActive(true);
      store.setLifecycleState("active");
      store.addToHistory({
        nodeId: result.data.id,
        speaker: result.data.speaker,
        text: result.data.text,
        emotion: result.data.emotion,
        timestamp: new Date().toISOString(),
      });
    } else {
      store.setError(result.error.message);
    }
    store.setLoading(false);
  }, [params.caseId, params.npcId, params.playerId, engine, store]);

  const end = useCallback(
    async (endState: "completed" | "failed" | "cancelled" = "completed") => {
      store.setLoading(true);
      const result = await engine.endDialogue(
        params.caseId,
        params.npcId,
        params.playerId,
        endState,
      );
      if (result.success) {
        store.setActive(false);
        store.setLifecycleState(endState);
        store.setCurrentNode(null);
      }
      store.setLoading(false);
    },
    [params.caseId, params.npcId, params.playerId, engine, store],
  );

  return {
    start,
    end,
    currentNode: store.currentNode,
    isActive: store.isActive,
    isLoading: store.isLoading,
    error: store.errorMessage,
  };
}

export function useDialogue(): {
  selectChoice: (choiceId: string) => Promise<DialogueNode | null>;
  presentEvidence: (evidenceId: string) => Promise<void>;
  currentNode: DialogueNode | null;
  availableChoices: import("@/domain/engines/i-dialogue-engine").DialogueChoice[];
} {
  const engine = useMemo(() => getEngine(), []);
  const store = useEngineDialogueStore();

  const selectChoice = useCallback(
    async (choiceId: string) => {
      const caseId = store.currentCaseId;
      const npc = store.currentNpcId;
      const playerId = store.currentPlayerId;
      if (!caseId || !npc || !playerId) return null;

      store.setLoading(true);
      store.setError(null);

      const result = await engine.selectChoice(caseId, npc, choiceId, playerId);

      if (result.success) {
        store.setCurrentNode(result.data);
        store.setSelectedChoiceId(choiceId);
        store.setAvailableChoices(result.data.choices);
        store.addToHistory({
          nodeId: result.data.id,
          speaker: result.data.speaker,
          text: result.data.text,
          emotion: result.data.emotion,
          timestamp: new Date().toISOString(),
        });

        if (result.data.isEndNode) {
          store.setLifecycleState("completed");
        }
      } else {
        store.setError(result.error.message);
      }

      store.setLoading(false);
      return result.success ? result.data : null;
    },
    [engine, store],
  );

  const presentEvidence = useCallback(
    async (evidenceId: string) => {
      const caseId = store.currentCaseId;
      const npc = store.currentNpcId;
      const playerId = store.currentPlayerId;
      if (!caseId || !npc || !playerId) return;

      store.setLoading(true);
      const result = await engine.presentEvidence(caseId, npc, playerId, evidenceId);
      if (result.success) {
        store.addPresentedEvidence(evidenceId);
        if (result.data.journalEntry) {
          store.addJournalEntry({
            type: result.data.journalEntry.type,
            title: result.data.journalEntry.title,
            content: result.data.journalEntry.content,
            isImportant: result.data.journalEntry.isImportant,
          });
        }
      }
      store.setLoading(false);
    },
    [engine, store],
  );

  return {
    selectChoice,
    presentEvidence,
    currentNode: store.currentNode,
    availableChoices: store.availableChoices,
  };
}

export function useDialogueCurrentNode(): DialogueNode | null {
  return useEngineDialogueStore((s) => s.currentNode);
}

export function useDialogueNPCState(npcId: string): NPCStateDefinition | undefined {
  const engine = useMemo(() => getEngine(), []);
  return engine.getNPCState(npcId);
}

export function useDialogueNPCStates(): {
  all: NPCStateDefinition[];
  byId: (npcId: string) => NPCStateDefinition | undefined;
} {
  const engine = useMemo(() => getEngine(), []);

  return useMemo(
    () => ({
      all: engine.getAllNPCs(),
      byId: (npcId: string) => engine.getNPCState(npcId),
    }),
    [engine],
  );
}

export function useConversationHistory(): Array<{
  nodeId: string;
  speaker: string;
  text: string;
  emotion: string | null;
  timestamp: string;
}> {
  return useEngineDialogueStore((s) => s.conversationHistory);
}

export function useUnlockedTopics(): {
  topics: string[];
  hasTopic: (topicId: string) => boolean;
} {
  const topics = useEngineDialogueStore((s) => s.unlockedTopics);

  return useMemo(
    () => ({
      topics,
      hasTopic: (topicId: string) => topics.includes(topicId),
    }),
    [topics],
  );
}

export function useDialogueJournal(): {
  entries: Array<{
    type: string;
    title: string;
    content: string;
    isImportant: boolean;
  }>;
  important: Array<{
    type: string;
    title: string;
    content: string;
    isImportant: boolean;
  }>;
} {
  const entries = useEngineDialogueStore((s) => s.journalEntries);

  return useMemo(
    () => ({
      entries,
      important: entries.filter((e) => e.isImportant),
    }),
    [entries],
  );
}

export function useDialogueValidation(caseId: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const engine = useMemo(() => getEngine(), []);

  return useMemo(() => {
    const result = engine.validate(caseId);
    return {
      isValid: result.isValid,
      errors: result.errors?.map((e) => e.message) ?? [],
      warnings: result.warnings?.map((w) => w.message) ?? [],
    };
  }, [engine, caseId]);
}
