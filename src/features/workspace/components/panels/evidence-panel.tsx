"use client";

import { useState } from "react";
import { Panel } from "./panel";
import { useEvidenceList, useEvidenceEngine } from "@/features/evidence/hooks";
import { getTimelineEngine } from "@/features/timeline/hooks";
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

export function EvidencePanel() {
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const evidenceList = useEvidenceList(DEFAULT_FILTERS);
  const engine = useEvidenceEngine();

  // Find selected evidence
  const selectedEvidence = evidenceList.find((e) => e.id === selectedEvidenceId);

  // Filter collected vs uncollected
  const collectedEvidence = evidenceList.filter((e) => e.collectedAt !== null);

  const handleAnalyze = (id: string) => {
    try {
      engine.analyzeEvidence(id, `Analyzed on ${new Date().toLocaleTimeString()}`);

      // Auto unlock timeline events when cellar log is analyzed
      if (id === "ev-cellar-log") {
        const timelineEngine = getTimelineEngine();
        timelineEngine.discoverEvent("time-arthur-cellar-entry");
        timelineEngine.discoverEvent("time-arthur-exit");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Panel
      panelId="evidence"
      header="Evidence Inventory"
      badge={collectedEvidence.length}
      variant="ghost"
    >
      <div className="border-border flex h-full min-h-[400px] border-t">
        {/* Left side list */}
        <div className="border-border scrollable w-1/2 space-y-2 overflow-y-auto border-r p-3">
          {collectedEvidence.length === 0 ? (
            <div className="text-muted py-8 text-center text-xs">
              No evidence collected yet. Examine hotspots in observations or question NPCs to find
              clues.
            </div>
          ) : (
            collectedEvidence.map((ev) => (
              <button
                key={ev.id}
                type="button"
                onClick={() => setSelectedEvidenceId(ev.id)}
                className={`w-full rounded-lg border p-3 text-left transition-all duration-150 ${
                  selectedEvidenceId === ev.id
                    ? "bg-accent-subtle border-accent"
                    : "bg-surface border-border hover:border-interactive-hover"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-foreground text-xs font-medium">{ev.name}</span>
                  {ev.isKey && (
                    <span className="py-0.2 rounded bg-amber-500/20 px-1.5 text-[9px] font-semibold text-amber-500 uppercase">
                      Key
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="bg-surface-alt border-border text-muted rounded border px-1.5 py-0.5 text-[9px] capitalize">
                    {ev.category}
                  </span>
                  {ev.analyzedAt && (
                    <span className="rounded border border-teal-500/30 bg-teal-500/20 px-1.5 py-0.5 text-[9px] text-teal-400">
                      Analyzed
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Right side details */}
        <div className="scrollable w-1/2 overflow-y-auto p-4">
          {selectedEvidence ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-foreground text-sm font-semibold">{selectedEvidence.name}</h3>
                <p className="text-muted mt-1.5 text-xs leading-relaxed">
                  {selectedEvidence.description}
                </p>
              </div>

              {/* Detailed Specs */}
              <div className="border-border bg-surface space-y-2 rounded-lg border p-3 text-xs">
                <span className="text-muted border-border block border-b pb-1 font-medium">
                  Forensic Specifications
                </span>
                <div className="grid grid-cols-2 gap-y-1.5 text-[11px]">
                  <span className="text-muted">Serial Code:</span>
                  <span className="text-foreground font-mono">
                    {selectedEvidence.metadata?.serialNumber || "N/A"}
                  </span>
                  <span className="text-muted">Material:</span>
                  <span className="text-foreground">
                    {selectedEvidence.metadata?.material || "N/A"}
                  </span>
                  <span className="text-muted">Condition:</span>
                  <span className="text-foreground">
                    {selectedEvidence.metadata?.condition || "N/A"}
                  </span>
                  <span className="text-muted">Discovered at:</span>
                  <span className="text-foreground capitalize">
                    {selectedEvidence.location.replace("loc-", "").replace("-", " ")}
                  </span>
                </div>
              </div>

              {/* Analysis Log */}
              <div className="border-border bg-surface space-y-2 rounded-lg border p-3 text-xs">
                <span className="text-muted border-border block border-b pb-1 font-medium">
                  Forensic Lab Analysis
                </span>
                {selectedEvidence.analyzedAt ? (
                  <div className="space-y-1">
                    <span className="flex items-center gap-1 text-[11px] font-medium text-teal-400">
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Analysis Complete
                    </span>
                    <p className="text-muted mt-1 text-[11px] leading-relaxed">
                      {selectedEvidence.id === "ev-wine-bottle" &&
                        "Chemical test confirms lethal potassium cyanide powder was mixed directly into the Pinot Noir."}
                      {selectedEvidence.id === "ev-cyanide-ring" &&
                        "Autopsy confirms potassium cyanide crystals matching the victim's lip swab residue inside the hidden hinge compartment."}
                      {selectedEvidence.id === "ev-counterfeit-ledger" &&
                        "Invoices confirm hundreds of cheap domestic Pinot bottles were relabeled as Chateau Latour 1945."}
                      {selectedEvidence.id === "ev-cellar-log" &&
                        "Keycard records prove Arthur Sterling was inside the cellar between 9:00 PM and 9:15 PM, contradicting his office alibi."}
                      {selectedEvidence.id === "ev-corkscrew" &&
                        "Prong score markings match bottleneck micro-scratches, proving this exact tool opened the poisoned bottle."}
                      {selectedEvidence.id === "ev-poison-report" &&
                        "Toxicology report confirms potassium cyanide as the death agent. Estimated speed of action: under 30 seconds."}
                      {selectedEvidence.id === "ev-office-key" &&
                        "Allows entry to Arthur Sterling's locked Private Office."}
                    </p>
                  </div>
                ) : (
                  <div className="py-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleAnalyze(selectedEvidence.id)}
                      className="w-full rounded bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow transition-colors hover:bg-teal-700"
                    >
                      Perform Lab Analysis
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-muted flex h-full flex-col items-center justify-center py-12 text-xs">
              <svg
                className="mb-2 h-8 w-8 opacity-30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Select an item to inspect forensic logs
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}
