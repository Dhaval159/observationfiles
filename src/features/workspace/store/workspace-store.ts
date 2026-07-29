import { create } from "zustand";
import { persist } from "zustand/middleware";
import { storageKeys } from "@/config/storage";
import type {
  PanelId,
  SplitMode,
  CanvasView,
  WorkspaceLayout,
} from "@/features/workspace/types/workspace";

interface WorkspaceStore {
  layout: WorkspaceLayout;
  quickSearchOpen: boolean;
  commandPaletteOpen: boolean;
  quickNotes: string;
  setNavigationCollapsed: (collapsed: boolean) => void;
  toggleNavigation: () => void;
  setNavigationWidth: (width: number) => void;
  setContextPanelOpen: (open: boolean) => void;
  toggleContextPanel: () => void;
  setContextPanelWidth: (width: number) => void;
  setSplitMode: (mode: SplitMode) => void;
  setSplitSizes: (sizes: number[]) => void;
  setActivePanel: (panel: PanelId | null) => void;
  setActiveSecondaryPanel: (panel: PanelId | null) => void;
  setCanvasView: (view: CanvasView) => void;
  toggleQuickSearch: () => void;
  setQuickSearchOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setQuickNotes: (notes: string) => void;
  resetLayout: () => void;
}

const defaultLayout: WorkspaceLayout = {
  navigationCollapsed: false,
  navigationWidth: 220,
  contextPanelOpen: false,
  contextPanelWidth: 320,
  splitMode: "single",
  splitSizes: [1],
  activePanel: null,
  activeSecondaryPanel: null,
  canvasView: "scene",
};

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set) => ({
      layout: { ...defaultLayout },
      quickSearchOpen: false,
      commandPaletteOpen: false,
      quickNotes: "",

      setNavigationCollapsed: (collapsed) =>
        set((s) => ({ layout: { ...s.layout, navigationCollapsed: collapsed } })),

      toggleNavigation: () =>
        set((s) => ({
          layout: { ...s.layout, navigationCollapsed: !s.layout.navigationCollapsed },
        })),

      setNavigationWidth: (width) =>
        set((s) => ({ layout: { ...s.layout, navigationWidth: width } })),

      setContextPanelOpen: (open) =>
        set((s) => ({ layout: { ...s.layout, contextPanelOpen: open } })),

      toggleContextPanel: () =>
        set((s) => ({ layout: { ...s.layout, contextPanelOpen: !s.layout.contextPanelOpen } })),

      setContextPanelWidth: (width) =>
        set((s) => ({ layout: { ...s.layout, contextPanelWidth: width } })),

      setSplitMode: (mode) =>
        set((s) => ({
          layout: {
            ...s.layout,
            splitMode: mode,
            splitSizes: mode === "single" ? [1] : mode === "dual" ? [1, 1] : [1, 1, 1],
          },
        })),

      setSplitSizes: (sizes) => set((s) => ({ layout: { ...s.layout, splitSizes: sizes } })),

      setActivePanel: (panel) => set((s) => ({ layout: { ...s.layout, activePanel: panel } })),

      setActiveSecondaryPanel: (panel) =>
        set((s) => ({ layout: { ...s.layout, activeSecondaryPanel: panel } })),

      setCanvasView: (view) => set((s) => ({ layout: { ...s.layout, canvasView: view } })),

      toggleQuickSearch: () => set((s) => ({ quickSearchOpen: !s.quickSearchOpen })),

      setQuickSearchOpen: (open) => set({ quickSearchOpen: open }),

      toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),

      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

      setQuickNotes: (notes) => set({ quickNotes: notes }),

      resetLayout: () => set({ layout: { ...defaultLayout } }),
    }),
    {
      name: storageKeys.workspaceLayout,
      partialize: (state) => ({
        layout: {
          navigationCollapsed: state.layout.navigationCollapsed,
          navigationWidth: state.layout.navigationWidth,
          contextPanelOpen: state.layout.contextPanelOpen,
          contextPanelWidth: state.layout.contextPanelWidth,
          splitMode: state.layout.splitMode,
          splitSizes: state.layout.splitSizes,
        },
        quickNotes: state.quickNotes,
      }),
    },
  ),
);
