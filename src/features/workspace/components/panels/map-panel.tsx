"use client";

import { Panel } from "./panel";
import { useCurrentLocation } from "@/features/investigation/hooks/use-current-location";

export function MapPanel() {
  const playerId = "player_1";
  const { locationId, moveTo } = useCurrentLocation(playerId);

  const locations = [
    {
      id: "loc-tasting-room",
      name: "Tasting Room",
      coords: "x-1/2 y-1/3",
      npcList: ["Arthur Sterling", "Elena Rostova", "Dr. Vance"],
      desc: "Suspects & witnesses assembled here.",
      bgColor: "bg-amber-500/10 border-amber-500/30",
    },
    {
      id: "loc-wine-cellar",
      name: "Wine Cellar",
      coords: "x-1/3 y-2/3",
      npcList: ["Julien Croft (Deceased)"],
      desc: "Crime scene location.",
      bgColor: "bg-destructive/10 border-destructive/30",
    },
    {
      id: "loc-private-office",
      name: "Private Office",
      coords: "x-2/3 y-2/3",
      npcList: [],
      desc: "Arthur's locked sanctuary.",
      bgColor: "bg-purple-500/10 border-purple-500/30",
    },
  ];

  return (
    <Panel panelId="map" header="Estate Floor Blueprint" variant="ghost">
      <div className="space-y-6 p-4">
        <p className="text-muted text-xs">
          Architectural floorplan showing physical boundaries and character tracking.
        </p>

        {/* Blueprint Layout Grid */}
        <div className="border-border bg-background relative flex min-h-[300px] flex-col justify-between rounded-lg border p-6">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px] opacity-10"></div>

          <div className="relative z-10 grid grid-cols-2 gap-6">
            {locations.map((loc) => {
              const isActive = locationId === loc.id;
              return (
                <div
                  key={loc.id}
                  className={`flex flex-col justify-between rounded-lg border p-4 ${loc.bgColor} ${
                    isActive ? "ring-accent ring-2" : ""
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-foreground text-xs font-semibold">{loc.name}</span>
                      {isActive && (
                        <span className="bg-accent text-accent-foreground py-0.2 rounded px-1.5 text-[9px] font-bold uppercase">
                          Here
                        </span>
                      )}
                    </div>
                    <p className="text-muted mt-1.5 text-[10px]">{loc.desc}</p>

                    {loc.npcList.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <span className="text-muted block text-[9px] font-semibold tracking-wider uppercase">
                          Tracked Characters:
                        </span>
                        <ul className="text-foreground list-inside list-disc pl-1 text-[10px]">
                          {loc.npcList.map((n, i) => (
                            <li key={i}>{n}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-end">
                    {isActive ? (
                      <span className="text-accent text-[10px] font-bold">Investigating Scene</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => moveTo(loc.id)}
                        className="bg-accent hover:bg-accent-hover text-accent-foreground rounded px-3 py-1 text-[10px] font-semibold transition-colors"
                      >
                        Enter Room
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-muted border-border/40 z-10 mt-6 border-t pt-4 text-center text-[10px]">
            Double click map borders or select lists to zoom details.
          </div>
        </div>
      </div>
    </Panel>
  );
}
