import { create } from "zustand";
import type { ObservationLifecycleState } from "@/domain/engines/observation/types";

export interface EngineObservationState {
  currentObservationId: string | null;
  selectedObjectId: string | null;
  searchQuery: string;
  activeFilters: Record<string, unknown>;
  sortField: string | null;
  sortDirection: "asc" | "desc";
  lifecycleState: ObservationLifecycleState;
  isLoading: boolean;
  errorMessage: string | null;

  setCurrentObservationId: (id: string | null) => void;
  setSelectedObjectId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setActiveFilters: (filters: Record<string, unknown>) => void;
  addFilter: (key: string, value: unknown) => void;
  removeFilter: (key: string) => void;
  clearFilters: () => void;
  setSortField: (field: string | null) => void;
  setSortDirection: (direction: "asc" | "desc") => void;
  setLifecycleState: (state: ObservationLifecycleState) => void;
  setLoading: (loading: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
}

const initialState = {
  currentObservationId: null,
  selectedObjectId: null,
  searchQuery: "",
  activeFilters: {},
  sortField: null,
  sortDirection: "asc" as "asc" | "desc",
  lifecycleState: "hidden" as ObservationLifecycleState,
  isLoading: false,
  errorMessage: null,
};

export const useEngineObservationStore = create<EngineObservationState>((set) => ({
  ...initialState,
  setCurrentObservationId: (id) => set({ currentObservationId: id }),
  setSelectedObjectId: (id) => set({ selectedObjectId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveFilters: (filters) => set({ activeFilters: filters }),
  addFilter: (key, value) =>
    set((state) => ({
      activeFilters: { ...state.activeFilters, [key]: value },
    })),
  removeFilter: (key) =>
    set((state) => {
      const newFilters = { ...state.activeFilters };
      delete newFilters[key];
      return { activeFilters: newFilters };
    }),
  clearFilters: () => set({ activeFilters: {} }),
  setSortField: (field) => set({ sortField: field }),
  setSortDirection: (direction) => set({ sortDirection: direction }),
  setLifecycleState: (state) => set({ lifecycleState: state }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (message) => set({ errorMessage: message }),
  reset: () => set(initialState),
}));
