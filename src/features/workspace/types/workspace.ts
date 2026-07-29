import type { ReactNode } from "react";

export type PanelId =
  | "locations"
  | "evidence"
  | "suspects"
  | "witnesses"
  | "timeline"
  | "theory-board"
  | "dialogue"
  | "observations"
  | "objectives"
  | "notebook"
  | "bookmarks"
  | "case-files"
  | "map";

export type SplitMode = "single" | "dual" | "triple";

export type CanvasView = "scene" | "document" | "map" | "media";

export interface PanelConfig {
  id: PanelId;
  label: string;
  icon: ReactNode;
  shortcut?: string;
  badge?: string | number;
}

export interface PanelSize {
  width: number;
  height?: number;
}

export interface WorkspaceLayout {
  navigationCollapsed: boolean;
  navigationWidth: number;
  contextPanelOpen: boolean;
  contextPanelWidth: number;
  splitMode: SplitMode;
  splitSizes: number[];
  activePanel: PanelId | null;
  activeSecondaryPanel: PanelId | null;
  canvasView: CanvasView;
}

export interface ActionBarItem {
  id: string;
  label: string;
  icon: ReactNode;
  shortcut?: string;
  disabled?: boolean;
}

export interface TopBarState {
  caseName: string;
  caseProgress: number;
  currentObjective: string;
  breadcrumbs: string[];
  isSaving: boolean;
  caseTimer: string;
}
