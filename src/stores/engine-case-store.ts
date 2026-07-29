import { create } from "zustand";

export type EngineLifecycleState =
  | "unloaded"
  | "loading"
  | "validating"
  | "initializing"
  | "ready"
  | "running"
  | "paused"
  | "completing"
  | "completed"
  | "failing"
  | "failed"
  | "resetting"
  | "unloading"
  | "error"
  | "idle";

export interface EngineCaseState {
  currentCaseId: string | null;
  lifecycleState: EngineLifecycleState;
  isLoading: boolean;
  errorMessage: string | null;
  setCurrentCaseId: (id: string | null) => void;
  setLifecycleState: (state: EngineLifecycleState) => void;
  setLoading: (loading: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
}

const initialState = {
  currentCaseId: null,
  lifecycleState: "idle" as EngineLifecycleState,
  isLoading: false,
  errorMessage: null,
};

export const useEngineCaseStore = create<EngineCaseState>((set) => ({
  ...initialState,
  setCurrentCaseId: (id) => set({ currentCaseId: id }),
  setLifecycleState: (state) => set({ lifecycleState: state }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (message) => set({ errorMessage: message }),
  reset: () => set(initialState),
}));
