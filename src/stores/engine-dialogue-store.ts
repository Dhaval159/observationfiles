import { create } from "zustand";
import type { ConversationLifecycleState } from "@/domain/engines/dialogue/types";
import type { DialogueNode, DialogueChoice } from "@/domain/engines/i-dialogue-engine";

export interface EngineDialogueState {
  currentConversationId: string | null;
  currentCaseId: string | null;
  currentNpcId: string | null;
  currentPlayerId: string | null;
  currentNode: DialogueNode | null;
  availableChoices: DialogueChoice[];
  selectedChoiceId: string | null;
  lifecycleState: ConversationLifecycleState;
  conversationHistory: Array<{
    nodeId: string;
    speaker: string;
    text: string;
    emotion: string | null;
    timestamp: string;
  }>;
  npcStates: Record<string, {
    trust: number;
    stress: number;
    confidence: number;
    mood: string;
    suspicion: number;
    patience: number;
    cooperation: number;
    fear: number;
    anger: number;
    respect: number;
    emotionalState: string;
    relationship: string;
  }>;
  unlockedTopics: string[];
  unlockedQuestions: string[];
  presentedEvidence: string[];
  journalEntries: Array<{
    type: string;
    title: string;
    content: string;
    isImportant: boolean;
  }>;
  isLoading: boolean;
  isActive: boolean;
  errorMessage: string | null;

  setCurrentConversationId: (id: string | null) => void;
  setCurrentCaseId: (id: string | null) => void;
  setCurrentNpcId: (id: string | null) => void;
  setCurrentPlayerId: (id: string | null) => void;
  setCurrentNode: (node: DialogueNode | null) => void;
  setAvailableChoices: (choices: DialogueChoice[]) => void;
  setSelectedChoiceId: (id: string | null) => void;
  setLifecycleState: (state: ConversationLifecycleState) => void;
  addToHistory: (entry: {
    nodeId: string;
    speaker: string;
    text: string;
    emotion: string | null;
    timestamp: string;
  }) => void;
  updateNPCState: (npcId: string, state: Partial<EngineDialogueState["npcStates"][string]>) => void;
  addUnlockedTopic: (topicId: string) => void;
  addUnlockedQuestion: (questionId: string) => void;
  addPresentedEvidence: (evidenceId: string) => void;
  addJournalEntry: (entry: { type: string; title: string; content: string; isImportant: boolean }) => void;
  setLoading: (loading: boolean) => void;
  setActive: (active: boolean) => void;
  setError: (message: string | null) => void;
  resetConversation: () => void;
  resetAll: () => void;
}

const initialState = {
  currentConversationId: null as string | null,
  currentCaseId: null as string | null,
  currentNpcId: null as string | null,
  currentPlayerId: null as string | null,
  currentNode: null as DialogueNode | null,
  availableChoices: [] as DialogueChoice[],
  selectedChoiceId: null as string | null,
  lifecycleState: "unavailable" as ConversationLifecycleState,
  conversationHistory: [] as Array<{
    nodeId: string; speaker: string; text: string;
    emotion: string | null; timestamp: string;
  }>,
  npcStates: {} as Record<string, {
    trust: number; stress: number; confidence: number; mood: string;
    suspicion: number; patience: number; cooperation: number;
    fear: number; anger: number; respect: number;
    emotionalState: string; relationship: string;
  }>,
  unlockedTopics: [] as string[],
  unlockedQuestions: [] as string[],
  presentedEvidence: [] as string[],
  journalEntries: [] as Array<{
    type: string; title: string; content: string; isImportant: boolean;
  }>,
  isLoading: false,
  isActive: false,
  errorMessage: null as string | null,
};

export const useEngineDialogueStore = create<EngineDialogueState>((set) => ({
  ...initialState,
  setCurrentConversationId: (id) => set({ currentConversationId: id }),
  setCurrentCaseId: (id) => set({ currentCaseId: id }),
  setCurrentNpcId: (id) => set({ currentNpcId: id }),
  setCurrentPlayerId: (id) => set({ currentPlayerId: id }),
  setCurrentNode: (node) => set({ currentNode: node }),
  setAvailableChoices: (choices) => set({ availableChoices: choices }),
  setSelectedChoiceId: (id) => set({ selectedChoiceId: id }),
  setLifecycleState: (state) => set({ lifecycleState: state }),
  addToHistory: (entry) =>
    set((s) => ({ conversationHistory: [...s.conversationHistory, entry] })),
  updateNPCState: (npcId, stateUpdates) =>
    set((s) => ({
      npcStates: {
        ...s.npcStates,
        [npcId]: { ...s.npcStates[npcId], ...stateUpdates } as EngineDialogueState["npcStates"][string],
      },
    })),
  addUnlockedTopic: (topicId) =>
    set((s) =>
      s.unlockedTopics.includes(topicId)
        ? s
        : { unlockedTopics: [...s.unlockedTopics, topicId] },
    ),
  addUnlockedQuestion: (questionId) =>
    set((s) =>
      s.unlockedQuestions.includes(questionId)
        ? s
        : { unlockedQuestions: [...s.unlockedQuestions, questionId] },
    ),
  addPresentedEvidence: (evidenceId) =>
    set((s) =>
      s.presentedEvidence.includes(evidenceId)
        ? s
        : { presentedEvidence: [...s.presentedEvidence, evidenceId] },
    ),
  addJournalEntry: (entry) =>
    set((s) => ({ journalEntries: [...s.journalEntries, entry] })),
  setLoading: (loading) => set({ isLoading: loading }),
  setActive: (active) => set({ isActive: active }),
  setError: (message) => set({ errorMessage: message }),
  resetConversation: () =>
    set({
      currentNode: null,
      availableChoices: [],
      selectedChoiceId: null,
      lifecycleState: "unavailable",
      conversationHistory: [],
    }),
  resetAll: () => set(initialState),
}));
