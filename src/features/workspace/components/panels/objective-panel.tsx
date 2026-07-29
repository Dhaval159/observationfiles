"use client";

import { Panel } from "./panel";
import { EmptyState } from "@/components/ui/empty-state";

export function ObjectivePanel() {
  return (
    <Panel panelId="objectives" header="Objectives" variant="ghost">
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
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        }
        title="Objectives"
        description="Case objectives and progress will be tracked here."
      />
    </Panel>
  );
}
