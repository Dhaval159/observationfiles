"use client";

import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/features/workspace/store/workspace-store";
import {
  NotebookPanel,
  EvidencePanel,
  ObservationPanel,
  DialoguePanel,
  TimelinePanel,
  TheoryBoardPanel,
  MapPanel,
  ObjectivePanel,
  LocationsPanel,
  SuspectsPanel,
  WitnessesPanel,
} from "./panels";
import { EmptyState } from "@/components/ui/empty-state";

const panelComponents: Record<string, React.ReactNode> = {
  locations: <LocationsPanel />,
  suspects: <SuspectsPanel />,
  witnesses: <WitnessesPanel />,
  "case-files": (
    <EmptyState
      icon={
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
        </svg>
      }
      title="Case Files"
      description="Case documents, reports, and records will appear here."
    />
  ),
  evidence: <EvidencePanel />,
  observations: <ObservationPanel />,
  dialogue: <DialoguePanel />,
  timeline: <TimelinePanel />,
  "theory-board": <TheoryBoardPanel />,
  notebook: <NotebookPanel />,
  map: <MapPanel />,
  objectives: <ObjectivePanel />,
};

export function InvestigationCanvas() {
  const layout = useWorkspaceStore((s) => s.layout);
  const splitMode = layout.splitMode;
  const activePanel = layout.activePanel;
  const activeSecondaryPanel = layout.activeSecondaryPanel;

  const hasNoActivePanel = !activePanel;
  const hasSecondaryPanel = activePanel && activeSecondaryPanel && splitMode !== "single";

  return (
    <div className="bg-background flex h-full w-full flex-col">
      {/* Canvas header with view controls */}
      <div className="border-border flex h-10 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <span className="text-foreground text-xs font-medium">
            {activePanel
              ? activePanel.charAt(0).toUpperCase() + activePanel.slice(1).replace("-", " ")
              : "Investigation Scene"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="text-muted hover:bg-interactive-hover hover:text-foreground rounded p-1 transition-colors"
            aria-label="Zoom in"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
          <span className="text-muted text-[10px] tabular-nums">100%</span>
          <button
            type="button"
            className="text-muted hover:bg-interactive-hover hover:text-foreground rounded p-1 transition-colors"
            aria-label="Zoom out"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
          <div className="bg-border mx-1 h-4 w-px" />
          <button
            type="button"
            className={cn(
              "rounded p-1 transition-colors",
              splitMode === "single" ? "text-foreground" : "text-muted hover:text-foreground",
            )}
            aria-label="Single view"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            </svg>
          </button>
          <button
            type="button"
            className={cn(
              "rounded p-1 transition-colors",
              splitMode === "dual" ? "text-foreground" : "text-muted hover:text-foreground",
            )}
            aria-label="Split view"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="12" y1="3" x2="12" y2="21" />
            </svg>
          </button>
        </div>
      </div>

      {/* Canvas content */}
      <div className="flex-1 overflow-hidden">
        {hasNoActivePanel ? (
          <div className="flex h-full items-center justify-center p-8">
            <div className="max-w-md text-center">
              <div className="border-border bg-surface mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-dashed">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <path d="M8 11h6" />
                  <path d="M11 8v6" />
                </svg>
              </div>
              <h2 className="text-foreground mb-2 text-lg font-semibold">
                Investigation Workspace
              </h2>
              <p className="text-muted mb-6 text-sm">
                Select a panel from the navigation to begin your investigation. Examine evidence,
                interview witnesses, build your timeline, and construct theories.
              </p>
              <div className="text-muted grid grid-cols-2 gap-2 text-left text-xs">
                <div className="border-border bg-surface rounded-lg border p-3">
                  <p className="text-foreground font-medium">Evidence</p>
                  <p>
                    Press <kbd className="bg-surface-alt rounded px-1 font-mono">2</kbd>
                  </p>
                </div>
                <div className="border-border bg-surface rounded-lg border p-3">
                  <p className="text-foreground font-medium">Timeline</p>
                  <p>
                    Press <kbd className="bg-surface-alt rounded px-1 font-mono">5</kbd>
                  </p>
                </div>
                <div className="border-border bg-surface rounded-lg border p-3">
                  <p className="text-foreground font-medium">Theory Board</p>
                  <p>
                    Press <kbd className="bg-surface-alt rounded px-1 font-mono">6</kbd>
                  </p>
                </div>
                <div className="border-border bg-surface rounded-lg border p-3">
                  <p className="text-foreground font-medium">Quick Search</p>
                  <p>
                    Press <kbd className="bg-surface-alt rounded px-1 font-mono">Ctrl+K</kbd>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={cn("flex h-full", splitMode !== "single" && "divide-border divide-x")}>
            <div className="flex-1 overflow-hidden">
              {panelComponents[activePanel] ?? panelComponents["evidence"]}
            </div>
            {hasSecondaryPanel && (
              <div className="flex-1 overflow-hidden">
                {panelComponents[activeSecondaryPanel] ?? (
                  <EmptyState
                    title="Select a panel"
                    description="Choose a secondary panel to view alongside the primary."
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
