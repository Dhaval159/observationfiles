import { create } from "zustand";
import type { Case, CaseProgress } from "@/types/case";

interface CaseStore {
  cases: Case[];
  currentCase: Case | null;
  progress: Record<string, CaseProgress>;
  setCases: (cases: Case[]) => void;
  setCurrentCase: (caseItem: Case | null) => void;
  setProgress: (caseId: string, progress: CaseProgress) => void;
  reset: () => void;
}

export const useCaseStore = create<CaseStore>((set) => ({
  cases: [],
  currentCase: null,
  progress: {},

  setCases: (cases) => set({ cases }),
  setCurrentCase: (caseItem) => set({ currentCase: caseItem }),
  setProgress: (caseId, progress) =>
    set((state) => ({
      progress: { ...state.progress, [caseId]: progress },
    })),
  reset: () => set({ cases: [], currentCase: null, progress: {} }),
}));
