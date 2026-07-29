"use client";

import { Panel } from "./panel";
import { EmptyState } from "@/components/ui/empty-state";

export function ObservationPanel() {
  return (
    <Panel panelId="observations" header="Observations" badge={0} variant="ghost">
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
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        }
        title="Observations"
        description="Your observations during the investigation will be recorded here."
      />
    </Panel>
  );
}
