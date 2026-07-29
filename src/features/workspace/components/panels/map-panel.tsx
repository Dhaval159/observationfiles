"use client";

import { Panel } from "./panel";
import { EmptyState } from "@/components/ui/empty-state";

export function MapPanel() {
  return (
    <Panel panelId="map" header="Map" variant="ghost">
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
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        }
        title="Map"
        description="Locations and crime scene map will appear here."
      />
    </Panel>
  );
}
