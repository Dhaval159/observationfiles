"use client";

import { useState } from "react";
import { Panel } from "./panel";
import { useObservations, useObserve } from "@/features/observation/hooks";
import { useCurrentLocation } from "@/features/investigation/hooks/use-current-location";
import { useEvidenceEngine } from "@/features/evidence/hooks";
import { poisonedPinotCase } from "@/features/cases/data/poisoned-pinot";
import { getTimelineEngine } from "@/features/timeline/hooks";

export function ObservationPanel() {
  const playerId = "player_1";
  const caseId = "case-poisoned-pinot";
  const { locationId } = useCurrentLocation(playerId);
  const { observe, isObserving } = useObserve(caseId, playerId);
  const evidenceEngine = useEvidenceEngine();

  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  // Get all active entries
  const { entries: observationEntries } = useObservations(caseId, playerId);

  // Filter objects by current location
  const localObjects = poisonedPinotCase.observationObjects.filter(
    (obj) => obj.locationId === locationId,
  );

  const handleExamineHotspot = (objId: string) => {
    setSelectedObjectId(selectedObjectId === objId ? null : objId);
  };

  const handleObserveClue = (obsId: string, _objId: string) => {
    observe(obsId, locationId || "loc-wine-cellar");

    // Discover timeline events on specific observations
    const timelineEngine = getTimelineEngine();
    if (obsId === "obs-lips-blue") {
      timelineEngine.discoverEvent("time-glass-shatter");
    }

    // Auto unlock associated evidence if relevant
    const relatedEvidence = poisonedPinotCase.evidenceItems.find(
      (ev) =>
        ev.unlockCondition?.type === "observation_made" && ev.unlockCondition.targetId === obsId,
    );

    if (relatedEvidence) {
      try {
        // Collect evidence into inventory automatically when clue is observed!
        evidenceEngine.collectEvidence(relatedEvidence.id);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <Panel panelId="observations" header="Scene Observations" variant="ghost">
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <span className="text-muted text-xs">
            Current Location:{" "}
            <strong className="text-foreground capitalize">
              {locationId?.replace("loc-", "").replace("-", " ") || "Winery"}
            </strong>
          </span>
        </div>

        {localObjects.length === 0 ? (
          <div className="text-muted bg-surface border-border rounded-lg border py-8 text-center text-xs">
            There are no hotspots to examine in this location. Travel to another area.
          </div>
        ) : (
          <div className="space-y-3">
            {localObjects.map((obj) => {
              const isSelected = selectedObjectId === obj.id;

              // Get all observations for this object
              const objectObservations = observationEntries.filter(
                (entry) => entry.definition.sourceObjectId === obj.id,
              );

              const discoveredCount = objectObservations.filter(
                (o) => o.lifecycleState === "observed" || o.lifecycleState === "verified",
              ).length;
              const totalCount = objectObservations.length;

              return (
                <div
                  key={obj.id}
                  className="border-border bg-surface overflow-hidden rounded-lg border transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => handleExamineHotspot(obj.id)}
                    className="hover:bg-interactive-hover flex w-full items-center justify-between p-3.5 text-left transition-colors"
                  >
                    <div>
                      <h3 className="text-foreground text-xs font-semibold">{obj.name}</h3>
                      <p className="text-muted mt-0.5 text-[11px]">{obj.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="bg-accent-subtle text-accent rounded px-2 py-0.5 text-[10px] font-medium">
                        {discoveredCount}/{totalCount} Clues
                      </span>
                      <svg
                        className={`text-muted h-4 w-4 transition-transform duration-200 ${isSelected ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {isSelected && (
                    <div className="bg-surface-alt border-border space-y-3 border-t p-3.5">
                      {objectObservations.map((entry) => {
                        const isDiscovered =
                          entry.lifecycleState === "observed" ||
                          entry.lifecycleState === "verified";

                        return (
                          <div
                            key={entry.id}
                            className="border-border bg-surface flex items-start justify-between gap-4 rounded-md border p-3"
                          >
                            <div className="flex-1 space-y-1">
                              <h4 className="text-foreground flex items-center gap-1.5 text-xs font-medium">
                                {isDiscovered ? entry.definition.title : "Unidentified Clue"}
                                <span className="bg-surface-alt text-muted py-0.2 rounded border px-1.5 font-mono text-[9px] uppercase">
                                  {entry.definition.category}
                                </span>
                              </h4>
                              <p className="text-muted text-[11px] leading-relaxed">
                                {isDiscovered
                                  ? entry.definition.description
                                  : "Examine this hotspot to locate details."}
                              </p>
                              {isDiscovered && entry.definition.detailedDescription && (
                                <p className="text-foreground bg-surface-alt border-border mt-2 rounded border p-2 font-serif text-[10px] leading-relaxed">
                                  {entry.definition.detailedDescription}
                                </p>
                              )}
                            </div>

                            <div className="flex-shrink-0">
                              {isDiscovered ? (
                                <span className="flex items-center gap-1 rounded-md bg-teal-500/10 px-2.5 py-1 text-[10px] font-semibold text-teal-400">
                                  <svg
                                    className="h-3.5 w-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                  >
                                    <path d="M5 13l4 4L19 7" />
                                  </svg>
                                  Discovered
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  disabled={isObserving}
                                  onClick={() => handleObserveClue(entry.id, obj.id)}
                                  className="bg-accent hover:bg-accent-hover text-accent-foreground rounded-md px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors"
                                >
                                  Observe
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Panel>
  );
}
