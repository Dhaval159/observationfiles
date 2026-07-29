"use client";

import { useEffect } from "react";
import { useWorkspaceStore } from "@/features/workspace/store/workspace-store";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { useMediaQuery } from "@/hooks/use-media-query";
import { TopInvestigationBar } from "./top-investigation-bar";
import { InvestigationNavigation } from "./investigation-navigation";
import { InvestigationCanvas } from "./investigation-canvas";
import { ContextPanel } from "./context-panel";
import { BottomActionBar } from "./bottom-action-bar";
import { QuickSearch } from "./quick-search";
import type { PanelId } from "@/features/workspace/types/workspace";

const PANEL_SHORTCUTS: Record<string, PanelId> = {
  "1": "locations",
  "2": "evidence",
  "3": "suspects",
  "4": "witnesses",
  "5": "timeline",
  "6": "theory-board",
  "7": "dialogue",
  "8": "observations",
  "9": "objectives",
  "0": "notebook",
};

interface InvestigationWorkspaceProps {
  caseName?: string;
  caseProgress?: number;
  currentObjective?: string;
}

export function InvestigationWorkspace({
  caseName,
  caseProgress = 0,
  currentObjective,
}: InvestigationWorkspaceProps) {
  const setActivePanel = useWorkspaceStore((s) => s.setActivePanel);
  const setQuickSearchOpen = useWorkspaceStore((s) => s.setQuickSearchOpen);
  const toggleCommandPalette = useWorkspaceStore((s) => s.toggleCommandPalette);
  const layout = useWorkspaceStore((s) => s.layout);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const panel = PANEL_SHORTCUTS[e.key];
      if (panel) {
        setActivePanel(layout.activePanel === panel ? null : panel);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setActivePanel, layout.activePanel]);

  useKeyboardShortcut({
    key: "k",
    modifiers: ["ctrl"],
    handler: () => toggleCommandPalette(),
  });

  useKeyboardShortcut({
    key: "f",
    modifiers: ["ctrl"],
    handler: () => setQuickSearchOpen(true),
  });

  useKeyboardShortcut({
    key: "Escape",
    modifiers: [],
    handler: () => setActivePanel(null),
  });

  useKeyboardShortcut({
    key: " ",
    modifiers: [],
    handler: (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      e.preventDefault();
    },
  });

  if (isMobile) {
    return (
      <div className="bg-background flex h-screen items-center justify-center p-8">
        <div className="max-w-sm text-center">
          <h2 className="text-foreground mb-2 text-lg font-semibold">Workspace Unavailable</h2>
          <p className="text-muted text-sm">
            The investigation workspace requires a larger screen. Please use a tablet or desktop
            device.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex h-screen flex-col overflow-hidden">
      <TopInvestigationBar
        caseName={caseName}
        caseProgress={caseProgress}
        currentObjective={currentObjective}
      />

      <div className="flex flex-1 overflow-hidden">
        <InvestigationNavigation />

        <div className="flex flex-1 overflow-hidden">
          <InvestigationCanvas />
          <ContextPanel />
        </div>
      </div>

      <BottomActionBar />
      <QuickSearch />
    </div>
  );
}
