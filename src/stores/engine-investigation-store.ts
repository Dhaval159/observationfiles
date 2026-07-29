import { create } from "zustand";

export type InvestigationEngineLifecycleState =
  | "not_started"
  | "preparing"
  | "exploring"
  | "inspecting"
  | "interrogating"
  | "analyzing"
  | "reviewing"
  | "paused"
  | "completed"
  | "failed"
  | "abandoned"
  | "idle";

export interface EngineInvestigationState {
  currentCaseId: string | null;
  currentPlayerId: string | null;
  lifecycleState: InvestigationEngineLifecycleState;
  isLoading: boolean;
  errorMessage: string | null;
  setCurrentCaseId: (id: string | null) => void;
  setCurrentPlayerId: (id: string | null) => void;
  setLifecycleState: (state: InvestigationEngineLifecycleState) => void;
  setLoading: (loading: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
}

const initialState = {
  currentCaseId: null,
  currentPlayerId: null,
  lifecycleState: "idle" as InvestigationEngineLifecycleState,
  isLoading: false,
  errorMessage: null,
};

export const useEngineInvestigationStore = create<EngineInvestigationState>((set) => ({
  ...initialState,
  setCurrentCaseId: (id) => set({ currentCaseId: id }),
  setCurrentPlayerId: (id) => set({ currentPlayerId: id }),
  setLifecycleState: (state) => set({ lifecycleState: state }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (message) => set({ errorMessage: message }),
  reset: () => set(initialState),
}));
