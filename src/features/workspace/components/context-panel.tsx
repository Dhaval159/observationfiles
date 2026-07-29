"use client";

import { useWorkspaceStore } from "@/features/workspace/store/workspace-store";
import { Panel } from "./panels";
import { EmptyState } from "@/components/ui/empty-state";

export function ContextPanel() {
  const layout = useWorkspaceStore((s) => s.layout);
  const setContextPanelOpen = useWorkspaceStore((s) => s.setContextPanelOpen);
  const setContextPanelWidth = useWorkspaceStore((s) => s.setContextPanelWidth);

  if (!layout.contextPanelOpen) {
    return (
      <div className="border-border bg-background-alt flex items-center border-l">
        <button
          type="button"
          onClick={() => setContextPanelOpen(true)}
          className="text-muted hover:text-foreground flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium tracking-wider uppercase transition-colors [writing-mode:vertical-lr]"
          aria-label="Open context panel"
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
            className="-rotate-90"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          Context
        </button>
      </div>
    );
  }

  return (
    <Panel
      panelId="context"
      header="Context"
      variant="ghost"
      resizable
      resizeDirection="horizontal"
      defaultSize={layout.contextPanelWidth}
      minSize={260}
      maxSize={500}
      onResize={setContextPanelWidth}
      actions={
        <button
          type="button"
          onClick={() => setContextPanelOpen(false)}
          className="text-muted hover:bg-interactive-hover hover:text-foreground flex items-center justify-center rounded p-0.5 transition-colors"
          aria-label="Close context panel"
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
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      }
    >
      <div className="p-4">
        <EmptyState
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          }
          title="Context Panel"
          description="Select evidence, NPCs, or timeline events to inspect details here."
        />
      </div>
    </Panel>
  );
}
