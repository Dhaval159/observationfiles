"use client";

import { useEffect, useState } from "react";
import { useWorkspaceStore } from "@/features/workspace/store/workspace-store";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { useMediaQuery } from "@/hooks/use-media-query";
import { TopInvestigationBar } from "./top-investigation-bar";
import { InvestigationNavigation } from "./investigation-navigation";
import { InvestigationCanvas } from "./investigation-canvas";
import { ContextPanel } from "./context-panel";
import { BottomActionBar } from "./bottom-action-bar";
import { QuickSearch } from "./quick-search";
import type { PanelId } from "@/features/workspace/types/workspace";
import { useEvidenceInventory } from "@/features/evidence/hooks";
import { useObservations } from "@/features/observation/hooks";

const PANEL_SHORTCUTS: Record<string, PanelId> = {
  "1": "locations",
  "2": "evidence",
  "3": "suspects",
  "4": "witnesses",
  "5": "timeline",
  "6": "theory-board",
  "7": "dialogue",
  "8": "observations",
  "9": "objectives",
  "0": "notebook",
};

interface InvestigationWorkspaceProps {
  caseName?: string;
  caseProgress?: number;
  currentObjective?: string;
}

export function InvestigationWorkspace({
  caseName,
  caseProgress = 0,
  currentObjective,
}: InvestigationWorkspaceProps) {
  const setActivePanel = useWorkspaceStore((s) => s.setActivePanel);
  const setQuickSearchOpen = useWorkspaceStore((s) => s.setQuickSearchOpen);
  const toggleCommandPalette = useWorkspaceStore((s) => s.toggleCommandPalette);
  const layout = useWorkspaceStore((s) => s.layout);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Accusation State
  const [isAccusing, setIsAccusing] = useState(false);
  const [accuseSuspect, setAccuseSuspect] = useState("");
  const [accuseMotive, setAccuseMotive] = useState("");
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([]);
  const [selectedObservations, setSelectedObservations] = useState<string[]>([]);
  const [accusationResult, setAccusationResult] = useState<{
    success: boolean;
    score: number;
    msg: string;
  } | null>(null);

  const inventory = useEvidenceInventory();
  const { entries: observations } = useObservations("case-poisoned-pinot", "player_1");
  const discoveredObs = observations.filter(
    (o) => o.lifecycleState === "observed" || o.lifecycleState === "verified",
  );

  const handleSubmitAccusation = () => {
    const correctSuspect = accuseSuspect === "npc-arthur";
    const correctMotive =
      accuseMotive.toLowerCase().includes("counterfeit") ||
      accuseMotive.toLowerCase().includes("forge");

    // Check key evidence (all 4 are required!)
    const requiredEvidence = [
      "ev-wine-bottle",
      "ev-cyanide-ring",
      "ev-counterfeit-ledger",
      "ev-cellar-log",
    ];
    const hasRequiredEvidence = requiredEvidence.every((id) => selectedEvidence.includes(id));

    // Check key observations (all 3 are required!)
    const requiredObservations = ["obs-corkscrew-marks", "obs-ring-powder", "obs-ledger-entries"];
    const hasRequiredObservations = requiredObservations.every((id) =>
      selectedObservations.includes(id),
    );

    if (correctSuspect && correctMotive && hasRequiredEvidence && hasRequiredObservations) {
      setAccusationResult({
        success: true,
        score: 100,
        msg: "Case Solved! You exposed Arthur Sterling's counterfeit scheme. He has confessed to poisoning Julien Croft's wine glass using his signet ring. Julien was threatening to notify the Wine Guild.",
      });
    } else {
      let score = 20;
      const reasons: string[] = [];
      if (!correctSuspect) reasons.push("Wrong culprit identified.");
      if (!correctMotive) reasons.push("Motive did not expose counterfeit wine racket.");
      if (!hasRequiredEvidence)
        reasons.push("Missing core physical evidence linking suspect to crime.");
      if (!hasRequiredObservations)
        reasons.push("Missing analytical observations detailing method.");

      if (correctSuspect) score += 30;
      if (correctMotive) score += 20;
      if (hasRequiredEvidence) score += 15;
      if (hasRequiredObservations) score += 15;

      setAccusationResult({
        success: false,
        score,
        msg: `Accusation rejected! Score: ${score}/100. Issues: ${reasons.join(" ")}`,
      });
    }
  };

  const handleToggleEvidence = (id: string) => {
    setSelectedEvidence((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleToggleObservation = (id: string) => {
    setSelectedObservations((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const panel = PANEL_SHORTCUTS[e.key];
      if (panel) {
        setActivePanel(layout.activePanel === panel ? null : panel);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setActivePanel, layout.activePanel]);

  useKeyboardShortcut({
    key: "k",
    modifiers: ["ctrl"],
    handler: () => toggleCommandPalette(),
  });

  useKeyboardShortcut({
    key: "f",
    modifiers: ["ctrl"],
    handler: () => setQuickSearchOpen(true),
  });

  useKeyboardShortcut({
    key: "Escape",
    modifiers: [],
    handler: () => {
      setActivePanel(null);
      setIsAccusing(false);
    },
  });

  useKeyboardShortcut({
    key: " ",
    modifiers: [],
    handler: (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      e.preventDefault();
    },
  });

  if (isMobile) {
    return (
      <div className="bg-background flex h-screen items-center justify-center p-8">
        <div className="max-w-sm text-center">
          <h2 className="text-foreground mb-2 text-lg font-semibold">Workspace Unavailable</h2>
          <p className="text-muted text-sm">
            The investigation workspace requires a larger screen. Please use a tablet or desktop
            device.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background relative flex h-screen flex-col overflow-hidden">
      <TopInvestigationBar
        caseName={caseName}
        caseProgress={caseProgress}
        currentObjective={currentObjective}
      />

      <div className="flex flex-1 overflow-hidden">
        <InvestigationNavigation />

        <div className="flex flex-1 overflow-hidden">
          <InvestigationCanvas />
          <ContextPanel />
        </div>
      </div>

      <BottomActionBar onAccuseClick={() => setIsAccusing(true)} />
      <QuickSearch />

      {/* Accusation Modal Overlay */}
      {isAccusing && (
        <div className="animate-fade-in absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
          <div className="bg-surface border-border scrollable flex max-h-[90%] w-full max-w-2xl flex-col space-y-4 overflow-y-auto rounded-xl border p-6 shadow-2xl">
            <div className="border-border flex items-start justify-between border-b pb-3">
              <div>
                <h2 className="text-foreground flex items-center gap-2 text-base font-bold">
                  <svg
                    className="h-5 w-5 animate-pulse text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Confront Suspect / Formulate Accusation
                </h2>
                <p className="text-muted mt-1 text-xs">
                  Select the suspect, state the motive, and attach verifying evidence and
                  observations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAccusing(false)}
                className="text-muted hover:text-foreground bg-surface-alt border-border rounded border p-1 text-sm font-bold"
              >
                Cancel
              </button>
            </div>

            {accusationResult ? (
              <div className="space-y-4 py-4 text-center">
                <div
                  className={`mx-auto max-w-md rounded-lg border p-4 text-xs ${
                    accusationResult.success
                      ? "border-teal-500/20 bg-teal-500/10 text-teal-400"
                      : "border-destructive/20 bg-destructive-subtle text-destructive"
                  }`}
                >
                  <span className="mb-1 block text-lg font-bold">
                    {accusationResult.success ? "✓ Accusation Verified" : "✗ Accusation Rejected"}
                  </span>
                  <span className="mb-2 block font-semibold">
                    Score: {accusationResult.score}/100
                  </span>
                  <p className="leading-relaxed">{accusationResult.msg}</p>
                </div>

                <div className="mt-6 flex justify-center gap-3">
                  {accusationResult.success ? (
                    <button
                      type="button"
                      onClick={() => (window.location.href = "/cases")}
                      className="bg-accent hover:bg-accent-hover text-accent-foreground rounded px-6 py-2 text-xs font-semibold shadow"
                    >
                      Return to Dashboard
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAccusationResult(null)}
                      className="bg-surface border-border text-foreground hover:bg-interactive-hover rounded border px-6 py-2 text-xs font-semibold shadow"
                    >
                      Try Again
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Suspect Pick */}
                <div className="space-y-1">
                  <label
                    htmlFor="suspectPick"
                    className="text-muted text-[10px] font-bold uppercase"
                  >
                    Select the Culprit
                  </label>
                  <select
                    id="suspectPick"
                    value={accuseSuspect}
                    onChange={(e) => setAccuseSuspect(e.target.value)}
                    className="bg-surface-alt border-border text-foreground w-full rounded border p-2 text-xs"
                  >
                    <option value="">-- Choose Culprit --</option>
                    <option value="npc-arthur">Arthur Sterling (Winery Owner)</option>
                    <option value="npc-elena">Elena Rostova (Assistant Sommelier)</option>
                    <option value="npc-vance">Dr. Marcus Vance (ME Guest)</option>
                  </select>
                </div>

                {/* Motive Type */}
                <div className="space-y-1">
                  <label
                    htmlFor="motiveDescription"
                    className="text-muted text-[10px] font-bold uppercase"
                  >
                    Describe the Motive
                  </label>
                  <input
                    id="motiveDescription"
                    type="text"
                    value={accuseMotive}
                    onChange={(e) => setAccuseMotive(e.target.value)}
                    placeholder="e.g. Threat of exposure for counterfeit vintages"
                    className="bg-surface-alt border-border text-foreground w-full rounded border p-2 text-xs"
                  />
                </div>

                {/* Evidence Checklist */}
                <div className="space-y-2">
                  <span className="text-muted block text-[10px] font-bold uppercase">
                    Attach Supporting Evidence ({selectedEvidence.length})
                  </span>
                  {inventory.length === 0 ? (
                    <p className="text-muted-foreground italic">
                      No evidence collected in inventory yet.
                    </p>
                  ) : (
                    <div className="border-border bg-surface-alt scrollable grid max-h-24 grid-cols-2 gap-2 overflow-y-auto rounded-lg border p-3">
                      {inventory.map((ev) => (
                        <label
                          key={ev.id}
                          className="flex cursor-pointer items-center gap-2 select-none"
                        >
                          <input
                            type="checkbox"
                            checked={selectedEvidence.includes(ev.id)}
                            onChange={() => handleToggleEvidence(ev.id)}
                            className="border-border text-accent focus:ring-accent rounded"
                          />
                          <span className="truncate">{ev.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Observations Checklist */}
                <div className="space-y-2">
                  <span className="text-muted block text-[10px] font-bold uppercase">
                    Attach Scene Clues / Observations ({selectedObservations.length})
                  </span>
                  {discoveredObs.length === 0 ? (
                    <p className="text-muted-foreground italic">No scene observations made yet.</p>
                  ) : (
                    <div className="border-border bg-surface-alt scrollable grid max-h-24 grid-cols-2 gap-2 overflow-y-auto rounded-lg border p-3">
                      {discoveredObs.map((obs) => (
                        <label
                          key={obs.id}
                          className="flex cursor-pointer items-center gap-2 select-none"
                        >
                          <input
                            type="checkbox"
                            checked={selectedObservations.includes(obs.id)}
                            onChange={() => handleToggleObservation(obs.id)}
                            className="border-border text-accent focus:ring-accent rounded"
                          />
                          <span className="truncate">{obs.definition.title}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-border flex justify-end gap-3 border-t pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAccusing(false)}
                    className="bg-surface-alt hover:bg-interactive-hover border-border text-foreground rounded-md border px-4 py-2 text-xs font-semibold transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitAccusation}
                    className="rounded-md bg-red-600 px-6 py-2 text-xs font-bold text-white shadow hover:bg-red-700"
                  >
                    Submit Accusation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
