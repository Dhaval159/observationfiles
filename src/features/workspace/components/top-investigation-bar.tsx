"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/features/workspace/store/workspace-store";
import { Progress } from "@/components/ui/progress";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";

interface TopInvestigationBarProps {
  caseName?: string;
  caseProgress?: number;
  currentObjective?: string;
}

export function TopInvestigationBar({
  caseName = "Active Case",
  caseProgress = 0,
  currentObjective = "Begin investigation",
}: TopInvestigationBarProps) {
  const toggleQuickSearch = useWorkspaceStore((s) => s.toggleQuickSearch);
  const toggleCommandPalette = useWorkspaceStore((s) => s.toggleCommandPalette);
  const quickNotes = useWorkspaceStore((s) => s.quickNotes);
  const setQuickNotes = useWorkspaceStore((s) => s.setQuickNotes);
  const toggleNavigation = useWorkspaceStore((s) => s.toggleNavigation);
  const toggleContextPanel = useWorkspaceStore((s) => s.toggleContextPanel);
  const layout = useWorkspaceStore((s) => s.layout);
  const [notesOpen, setNotesOpen] = useState(false);

  useKeyboardShortcut({
    key: "k",
    modifiers: ["ctrl"],
    handler: () => toggleCommandPalette(),
  });

  useKeyboardShortcut({
    key: "f",
    modifiers: ["ctrl"],
    handler: () => toggleQuickSearch(),
  });

  return (
    <header
      className="border-border bg-background-alt flex h-11 items-center gap-3 border-b px-3"
      role="banner"
    >
      {/* Navigation toggle */}
      <button
        type="button"
        onClick={toggleNavigation}
        className="text-muted hover:bg-interactive-hover hover:text-foreground flex items-center justify-center rounded p-1 transition-colors"
        aria-label={layout.navigationCollapsed ? "Open navigation" : "Close navigation"}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Breadcrumb */}
      <nav className="text-muted flex items-center gap-1.5 text-xs" aria-label="Breadcrumb">
        <span className="text-foreground font-medium">{caseName}</span>
      </nav>

      <div className="bg-border mx-2 h-5 w-px" />

      {/* Case progress */}
      <div className="flex items-center gap-2">
        <Progress value={caseProgress} size="sm" className="w-16" />
        <span className="text-muted text-[10px] tabular-nums">{caseProgress}%</span>
      </div>

      <div className="bg-border mx-2 h-5 w-px" />

      {/* Current objective */}
      <div className="flex items-center gap-1.5">
        <span className="text-accent text-[10px] font-medium tracking-wider uppercase">
          Objective
        </span>
        <span className="text-muted text-xs">{currentObjective}</span>
      </div>

      <div className="flex-1" />

      {/* Quick search */}
      <button
        type="button"
        onClick={toggleQuickSearch}
        className="border-border bg-surface text-muted hover:bg-interactive-hover hover:text-foreground flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs transition-colors"
        aria-label="Quick search"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span>Search</span>
        <kbd className="border-border bg-background rounded border px-1 font-mono text-[9px]">
          Ctrl+F
        </kbd>
      </button>

      {/* Quick notes */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setNotesOpen(!notesOpen)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors",
            notesOpen
              ? "bg-accent-subtle text-accent"
              : "text-muted hover:bg-interactive-hover hover:text-foreground",
          )}
          aria-label="Quick notes"
          aria-expanded={notesOpen}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          <span>Notes</span>
        </button>
        {notesOpen && (
          <div className="absolute top-full right-0 z-50 mt-1 w-72">
            <div className="border-border bg-surface rounded-lg border shadow-lg">
              <div className="border-border border-b px-3 py-2">
                <span className="text-foreground text-xs font-medium">Quick Notes</span>
              </div>
              <textarea
                value={quickNotes}
                onChange={(e) => setQuickNotes(e.target.value)}
                placeholder="Type your notes here..."
                className="scrollable text-foreground placeholder:text-muted h-32 w-full resize-none rounded-b-lg bg-transparent px-3 py-2 text-xs focus:outline-none"
                aria-label="Quick notes input"
              />
            </div>
          </div>
        )}
      </div>

      {/* Status indicators */}
      <div className="text-muted flex items-center gap-2 text-[10px]">
        <span className="flex items-center gap-1">
          <span className="bg-success h-1.5 w-1.5 rounded-full" />
          Saved
        </span>
        <span className="tabular-nums">--:--</span>
      </div>

      {/* Context panel toggle */}
      <button
        type="button"
        onClick={toggleContextPanel}
        className={cn(
          "flex items-center justify-center rounded p-1 transition-colors",
          layout.contextPanelOpen ? "text-accent" : "text-muted hover:text-foreground",
        )}
        aria-label="Toggle context panel"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="15" y1="3" x2="15" y2="21" />
        </svg>
      </button>
    </header>
  );
}
