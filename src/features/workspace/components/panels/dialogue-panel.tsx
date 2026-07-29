"use client";

import { Panel } from "./panel";
import { EmptyState } from "@/components/ui/empty-state";

export function DialoguePanel() {
  return (
    <Panel panelId="dialogue" header="Dialogue" variant="ghost">
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
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        }
        title="Dialogue"
        description="Conversation history with NPCs will appear here."
      />
    </Panel>
  );
}
