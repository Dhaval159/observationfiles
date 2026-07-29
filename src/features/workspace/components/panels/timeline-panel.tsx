"use client";

import { Panel } from "./panel";
import { EmptyState } from "@/components/ui/empty-state";

export function TimelinePanel() {
  return (
    <Panel panelId="timeline" header="Timeline" badge={0} variant="ghost">
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
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        }
        title="Timeline"
        description="Chronological events will be organized here."
      />
    </Panel>
  );
}
