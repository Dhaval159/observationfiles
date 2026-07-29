"use client";

import { Panel } from "./panel";
import { EmptyState } from "@/components/ui/empty-state";

export function NotebookPanel() {
  return (
    <Panel panelId="notebook" header="Notebook" badge={0} variant="ghost">
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
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        }
        title="Notebook"
        description="Notes, observations, and pinned evidence will appear here."
      />
    </Panel>
  );
}
