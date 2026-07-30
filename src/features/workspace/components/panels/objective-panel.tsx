"use client";

import { Panel } from "./panel";
import { useEvidenceInventory } from "@/features/evidence/hooks";
import { useObservations } from "@/features/observation/hooks";
import { useCurrentLocation } from "@/features/investigation/hooks/use-current-location";
export function ObjectivePanel() {
  const caseId = "case-poisoned-pinot";
  const playerId = "player_1";

  const inventory = useEvidenceInventory();
  const { entries: observations } = useObservations(caseId, playerId);
  const { visitedLocations } = useCurrentLocation(playerId);

  // Evaluate completions dynamically
  const isCellarVisited = visitedLocations.includes("loc-wine-cellar");
  const isRingCollected = inventory.some((e) => e.id === "ev-cyanide-ring");
  const isLedgerCollected = inventory.some((e) => e.id === "ev-counterfeit-ledger");
  const isDiaryObserved = observations.some(
    (o) =>
      o.id === "obs-diary-arguing" &&
      (o.lifecycleState === "observed" || o.lifecycleState === "verified"),
  );

  // Questioned suspects: we can check if they have ended conversation or if they have entries in history
  // Let's assume questioned if we unlocked the Private Office (Elena key dialogue) and Arthur alibi has been presented
  const arthurQuestioned =
    inventory.some((e) => e.id === "ev-cyanide-ring") ||
    inventory.some((e) => e.id === "ev-corkscrew");
  const elenaQuestioned = inventory.some((e) => e.id === "ev-office-key");
  const isSuspectsQuestioned = arthurQuestioned && elenaQuestioned;

  const objectives = [
    {
      id: "obj-explore-cellar",
      title: "Investigate the Wine Cellar",
      description: "Enter and inspect the cellar vault where Julien was killed.",
      type: "primary",
      isCompleted: isCellarVisited,
    },
    {
      id: "obj-question-suspects",
      title: "Question Suspects",
      description: "Interrogate winery owner Arthur Sterling and assistant Elena Rostova.",
      type: "primary",
      isCompleted: isSuspectsQuestioned,
    },
    {
      id: "obj-find-poison-source",
      title: "Identify Poison Source",
      description: "Locate Arthur's signet ring containing potassium cyanide crystals.",
      type: "primary",
      isCompleted: isRingCollected,
    },
    {
      id: "obj-reveal-motive",
      title: "Expose Culprit Motive",
      description: "Find the counterfeit shipping ledger inside Arthur's office desk.",
      type: "primary",
      isCompleted: isLedgerCollected,
    },
    {
      id: "obj-hidden-diary",
      title: "Find Elena's Diary (Hidden)",
      description: "Examine Elena's purse in the Tasting Room to find her private notebook.",
      type: "secondary",
      isCompleted: isDiaryObserved,
      isHidden: !isDiaryObserved, // Hidden until completed!
    },
  ];

  const visibleObjectives = objectives.filter((o) => !o.isHidden);

  return (
    <Panel
      panelId="objectives"
      header="Case Objectives"
      badge={visibleObjectives.filter((o) => !o.isCompleted).length}
      variant="ghost"
    >
      <div className="space-y-4 p-4">
        <p className="text-muted text-xs">
          Complete core tasks to proceed with suspect accusation and solve the mystery.
        </p>

        <div className="grid gap-3">
          {visibleObjectives.map((obj) => (
            <div
              key={obj.id}
              className={`flex items-start gap-3 rounded-lg border p-4 transition-all duration-200 ${
                obj.isCompleted
                  ? "border-teal-500/20 bg-teal-500/5"
                  : "bg-surface border-border hover:border-interactive-hover"
              }`}
            >
              <div className="pt-0.5">
                {obj.isCompleted ? (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full border border-teal-500 bg-teal-500/20 text-[10px] font-bold text-teal-400">
                    ✓
                  </div>
                ) : (
                  <div className="border-border flex h-4 w-4 items-center justify-center rounded-full border">
                    <div className="h-1.5 w-1.5 rounded-full bg-transparent"></div>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3
                  className={`flex items-center gap-2 text-xs font-semibold ${obj.isCompleted ? "text-teal-400 line-through opacity-70" : "text-foreground"}`}
                >
                  {obj.title}
                  {obj.type === "secondary" && (
                    <span className="py-0.2 rounded bg-amber-500/20 px-1.5 text-[8px] font-bold tracking-wider text-amber-400 uppercase">
                      Hidden Objective
                    </span>
                  )}
                </h3>
                <p className="text-muted mt-0.5 text-[11px] leading-relaxed">{obj.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
