import { create } from "zustand";
import { persist } from "zustand/middleware";
import { storageKeys } from "@/config/storage";

interface ProgressStore {
  completedCases: string[];
  evidenceFound: Record<string, string[]>;
  unlockedAchievements: string[];
  totalScore: number;
  addCompletedCase: (caseId: string) => void;
  addEvidence: (caseId: string, evidenceId: string) => void;
  unlockAchievement: (achievementId: string) => void;
  addScore: (points: number) => void;
  reset: () => void;
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set) => ({
      completedCases: [],
      evidenceFound: {},
      unlockedAchievements: [],
      totalScore: 0,

      addCompletedCase: (caseId) =>
        set((state) => ({
          completedCases: [...new Set([...state.completedCases, caseId])],
        })),

      addEvidence: (caseId, evidenceId) =>
        set((state) => ({
          evidenceFound: {
            ...state.evidenceFound,
            [caseId]: [...new Set([...(state.evidenceFound[caseId] ?? []), evidenceId])],
          },
        })),

      unlockAchievement: (achievementId) =>
        set((state) => ({
          unlockedAchievements: [...new Set([...state.unlockedAchievements, achievementId])],
        })),

      addScore: (points) =>
        set((state) => ({
          totalScore: state.totalScore + points,
        })),

      reset: () =>
        set({ completedCases: [], evidenceFound: {}, unlockedAchievements: [], totalScore: 0 }),
    }),
    {
      name: storageKeys.progress,
      partialize: (state) => ({
        completedCases: state.completedCases,
        evidenceFound: state.evidenceFound,
        unlockedAchievements: state.unlockedAchievements,
        totalScore: state.totalScore,
      }),
    },
  ),
);
