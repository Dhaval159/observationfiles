"use client";

import { Panel } from "./panel";
import { useState, useEffect } from "react";
import { useEvidenceList } from "@/features/evidence/hooks";
import { useObservations } from "@/features/observation/hooks";
import { useTimelineEvents } from "@/features/timeline/hooks";

import type { EvidenceFilters } from "@/features/evidence/types";

const DEFAULT_FILTERS: EvidenceFilters = {
  type: null,
  category: null,
  collected: null,
  analyzed: null,
  isKey: null,
  location: null,
  tags: null,
  searchQuery: "",
};

export function NotebookPanel() {
  const caseId = "case-poisoned-pinot";
  const playerId = "player_1";

  // Auto save notes to local storage
  const [notes, setNotes] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(`${caseId}_notes`) || "";
    }
    return "";
  });

  useEffect(() => {
    localStorage.setItem(`${caseId}_notes`, notes);
  }, [notes]);

  const evidence = useEvidenceList(DEFAULT_FILTERS);
  const { entries: observations } = useObservations(caseId, playerId);
  const { events } = useTimelineEvents();

  const collectedCount = evidence.filter((e) => e.collectedAt !== null).length;
  const observedCount = observations.filter(
    (o) => o.lifecycleState === "observed" || o.lifecycleState === "verified",
  ).length;
  const discoveredEvents = events.filter((e) => e.isDiscovered).length;

  return (
    <Panel panelId="notebook" header="Investigator Notebook" variant="ghost">
      <div className="border-border flex h-full min-h-[400px] border-t">
        {/* Left side text area */}
        <div className="border-border flex h-full w-1/2 flex-col space-y-3 border-r p-4">
          <span className="text-foreground block text-xs font-semibold">Case File Notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Type any findings, suspect alibi conflicts, key timelines, and theories here..."
            className="bg-surface border-border text-foreground h-[340px] w-full flex-1 resize-none rounded-lg border p-3 font-serif text-xs leading-relaxed"
          />
          <div className="text-muted flex items-center gap-1 text-[10px]">
            <svg
              className="h-3 w-3 text-teal-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
            Auto-saved to local storage
          </div>
        </div>

        {/* Right side stats and summaries */}
        <div className="scrollable w-1/2 space-y-4 overflow-y-auto p-4">
          <span className="text-foreground block text-xs font-semibold">Investigation Ledger</span>

          {/* Metrics Card */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-surface border-border rounded-lg border p-3">
              <span className="text-muted block text-[10px] font-bold uppercase">Evidence</span>
              <span className="text-foreground mt-1 block text-lg font-bold">{collectedCount}</span>
            </div>
            <div className="bg-surface border-border rounded-lg border p-3">
              <span className="text-muted block text-[10px] font-bold uppercase">Clues</span>
              <span className="text-foreground mt-1 block text-lg font-bold">{observedCount}</span>
            </div>
            <div className="bg-surface border-border rounded-lg border p-3">
              <span className="text-muted block text-[10px] font-bold uppercase">Timelines</span>
              <span className="text-foreground mt-1 block text-lg font-bold">
                {discoveredEvents}
              </span>
            </div>
          </div>

          {/* Suspects Brief */}
          <div className="border-border bg-surface space-y-3 rounded-lg border p-3 text-xs">
            <span className="text-muted border-border block border-b pb-1 font-medium">
              Suspect Status
            </span>

            <div className="space-y-3">
              <div className="border-border/40 flex items-start justify-between border-b pb-2 text-[11px]">
                <div>
                  <strong className="text-foreground block">Arthur Sterling</strong>
                  <span className="text-muted">Alibi: Office desk ledgers</span>
                </div>
                <span className="bg-destructive-subtle text-destructive py-0.2 border-destructive/20 rounded border px-1.5 text-[9px] font-semibold">
                  Contradicted
                </span>
              </div>

              <div className="flex items-start justify-between text-[11px]">
                <div>
                  <strong className="text-foreground block">Elena Rostova</strong>
                  <span className="text-muted">Alibi: Tasting dinner service</span>
                </div>
                <span className="py-0.2 rounded border border-teal-500/30 bg-teal-500/20 px-1.5 text-[9px] font-semibold text-teal-400">
                  Cooperative
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
