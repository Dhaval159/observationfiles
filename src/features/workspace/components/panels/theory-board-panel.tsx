"use client";

import { Panel } from "./panel";
import { EmptyState } from "@/components/ui/empty-state";

export function TheoryBoardPanel() {
  return (
    <Panel panelId="theory-board" header="Theory Board" variant="ghost">
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
            <circle cx="5" cy="6" r="3" />
            <circle cx="5" cy="18" r="3" />
            <circle cx="19" cy="6" r="3" />
            <circle cx="19" cy="18" r="3" />
            <line x1="5" y1="9" x2="5" y2="15" />
            <line x1="19" y1="9" x2="19" y2="15" />
            <polyline points="5 15 12 18 19 15" />
          </svg>
        }
        title="Theory Board"
        description="Build and connect your theories here."
      />
    </Panel>
  );
}
