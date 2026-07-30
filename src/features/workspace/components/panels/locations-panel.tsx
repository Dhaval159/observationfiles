"use client";

import { Panel } from "./panel";
import { useCurrentLocation } from "@/features/investigation/hooks/use-current-location";
import { useEvidenceInventory } from "@/features/evidence/hooks";
import { poisonedPinotCase } from "@/features/cases/data/poisoned-pinot";

export function LocationsPanel() {
  const playerId = "player_1";
  const { locationId, moveTo } = useCurrentLocation(playerId);
  const inventory = useEvidenceInventory();

  const hasOfficeKey = inventory.some((e) => e.id === "ev-office-key");

  return (
    <Panel panelId="locations" header="Locations" variant="ghost">
      <div className="space-y-4 p-4">
        <p className="text-muted text-xs">
          Travel between different winery areas to examine objects and question suspects.
        </p>

        <div className="grid gap-3">
          {poisonedPinotCase.definition.locations.map((loc) => {
            const isCurrent = locationId === loc.id;
            const isOffice = loc.id === "loc-private-office";
            const isLocked = isOffice && !hasOfficeKey;

            return (
              <div
                key={loc.id}
                className={`bg-surface flex flex-col justify-between rounded-lg border p-4 transition-all duration-200 ${
                  isCurrent
                    ? "border-accent ring-accent ring-1"
                    : "border-border hover:border-interactive-hover"
                }`}
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="text-foreground flex items-center gap-2 font-semibold">
                      {loc.name}
                      {isCurrent && (
                        <span className="bg-accent-subtle text-accent rounded px-2 py-0.5 text-[10px] font-medium">
                          Active Scene
                        </span>
                      )}
                      {isLocked && (
                        <span className="bg-destructive-subtle text-destructive flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium">
                          <svg
                            className="h-3 w-3 animate-pulse"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0110 0v4" />
                          </svg>
                          Locked
                        </span>
                      )}
                    </h3>
                    <p className="text-muted mt-1 text-xs">{loc.description}</p>
                  </div>
                </div>

                <div className="mt-3 flex justify-end">
                  {isCurrent ? (
                    <span className="text-accent bg-accent-subtle rounded-md px-3 py-1.5 text-xs font-semibold">
                      Currently Investigating
                    </span>
                  ) : isLocked ? (
                    <button
                      type="button"
                      disabled
                      className="bg-muted text-muted-foreground flex cursor-not-allowed items-center gap-1 rounded-md px-4 py-1.5 text-xs font-semibold opacity-50"
                    >
                      Requires Office Key
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => moveTo(loc.id)}
                      className="bg-accent hover:bg-accent-hover text-accent-foreground rounded-md px-4 py-1.5 text-xs font-semibold shadow-sm transition-colors"
                    >
                      Travel Here
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}
