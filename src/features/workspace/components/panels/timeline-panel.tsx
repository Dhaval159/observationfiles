"use client";

import { Panel } from "./panel";
import { useTimelineEvents, useTimelineEngine } from "@/features/timeline/hooks";
import { useState } from "react";

export function TimelinePanel() {
  const { orderedEvents } = useTimelineEvents();
  const engine = useTimelineEngine();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Filter to only discovered events
  const discoveredEvents = orderedEvents.filter((e) => e.isDiscovered);

  // Get active conflicts
  const conflicts = engine.getConflicts();

  const handleMoveUp = (id: string, index: number) => {
    if (index === 0) return;
    engine.moveEvent(id, index - 1);
  };

  const handleMoveDown = (id: string, index: number) => {
    if (index === discoveredEvents.length - 1) return;
    engine.moveEvent(id, index + 1);
  };

  const handleConfirmTime = (id: string) => {
    const event = engine.getEvent(id);
    if (!event) return;

    // Simulate confirming time
    try {
      engine.confirmEventTime(id);
      engine.analyzeEvent(id);
    } catch (e) {
      console.error(e);
    }
  };

  const selectedEvent = discoveredEvents.find((e) => e.id === selectedEventId);

  return (
    <Panel
      panelId="timeline"
      header="Timeline Mapping"
      badge={discoveredEvents.length}
      variant="ghost"
    >
      <div className="border-border flex h-full min-h-[460px] border-t">
        {/* Left timeline stack */}
        <div className="border-border scrollable w-1/2 space-y-4 overflow-y-auto border-r p-4">
          <p className="text-muted text-xs">
            Reconstruct the sequence of events. Move items up or down to resolve order
            contradictions.
          </p>

          <div className="relative space-y-3">
            {/* Center line decoration */}
            <div className="bg-border absolute top-2 bottom-2 left-6 -z-10 w-0.5"></div>

            {discoveredEvents.map((ev, index) => {
              const isSelected = selectedEventId === ev.id;
              const hasConflict = conflicts.some((c) => c.eventA === ev.id || c.eventB === ev.id);

              // Format time to HH:MM
              const timeStr = new Date(ev.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={ev.id}
                  className={`bg-surface flex items-start gap-3 rounded-lg border p-3 transition-all duration-150 ${
                    isSelected
                      ? "border-accent ring-accent ring-1"
                      : "border-border hover:border-interactive-hover"
                  }`}
                >
                  {/* Timeline point */}
                  <button
                    type="button"
                    onClick={() => setSelectedEventId(ev.id)}
                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border font-mono text-[10px] font-bold transition-colors ${
                      hasConflict
                        ? "bg-destructive-subtle text-destructive border-destructive/50"
                        : ev.isAnalyzed
                          ? "border-teal-500/40 bg-teal-500/20 text-teal-400"
                          : "bg-surface-alt text-muted border-border"
                    }`}
                  >
                    {index + 1}
                  </button>

                  <div className="min-w-0 flex-1" onClick={() => setSelectedEventId(ev.id)}>
                    <div className="flex items-center justify-between">
                      <span className="text-foreground truncate text-xs font-semibold">
                        {ev.title}
                      </span>
                      <span className="text-muted font-mono text-[10px]">{timeStr}</span>
                    </div>
                    <p className="text-muted mt-0.5 truncate text-[11px]">{ev.description}</p>

                    {hasConflict && (
                      <span className="bg-destructive-subtle text-destructive py-0.2 border-destructive/20 mt-1 inline-flex animate-pulse items-center gap-1 rounded border px-1.5 text-[9px] font-semibold">
                        Conflict Detected
                      </span>
                    )}
                  </div>

                  {/* Ordering arrows */}
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveUp(ev.id, index)}
                      className="text-muted hover:text-foreground bg-surface-alt border-border rounded border p-0.5 disabled:pointer-events-none disabled:opacity-30"
                      aria-label="Move event up"
                    >
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      disabled={index === discoveredEvents.length - 1}
                      onClick={() => handleMoveDown(ev.id, index)}
                      className="text-muted hover:text-foreground bg-surface-alt border-border rounded border p-0.5 disabled:pointer-events-none disabled:opacity-30"
                      aria-label="Move event down"
                    >
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right event details inspector */}
        <div className="scrollable w-1/2 overflow-y-auto p-4">
          {selectedEvent ? (
            <div className="space-y-4">
              <div>
                <span className="bg-accent-subtle text-accent border-accent/20 rounded border px-2 py-0.5 text-[9px] font-semibold uppercase">
                  {selectedEvent.eventType}
                </span>
                <h3 className="text-foreground mt-2 text-sm font-semibold">
                  {selectedEvent.title}
                </h3>
                <p className="text-muted mt-1.5 text-xs leading-relaxed">
                  {selectedEvent.description}
                </p>
              </div>

              {/* Event Metadata */}
              <div className="border-border bg-surface space-y-2 rounded-lg border p-3 text-xs">
                <span className="text-muted border-border block border-b pb-1 font-medium">
                  Event Logs
                </span>
                <div className="grid grid-cols-2 gap-y-1.5 text-[11px]">
                  <span className="text-muted">Suspects present:</span>
                  <span className="text-foreground">
                    {selectedEvent.participants.map((p) => p.replace("npc-", "")).join(", ") ||
                      "None"}
                  </span>
                  <span className="text-muted">Location:</span>
                  <span className="text-foreground capitalize">
                    {selectedEvent.location?.replace("loc-", "").replace("-", " ") || "Winery"}
                  </span>
                  <span className="text-muted">Reported Time:</span>
                  <span className="text-foreground font-mono">
                    {new Date(selectedEvent.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {/* Validation checks */}
              {conflicts
                .filter((c) => c.eventA === selectedEvent.id || c.eventB === selectedEvent.id)
                .map((c, i) => (
                  <div
                    key={i}
                    className="border-destructive/20 bg-destructive-subtle rounded-lg border p-3 text-xs"
                  >
                    <span className="text-destructive flex items-center gap-1.5 font-semibold">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Order Violation: {c.conflictType}
                    </span>
                    <p className="text-muted-foreground mt-1.5 text-[11px] leading-relaxed">
                      {c.resolutionNotes ||
                        "This event order is invalid. Check relationships: Julien must exit to cellar before anyone can poison him or discover the body."}
                    </p>
                  </div>
                ))}

              {/* Action logs */}
              <div className="border-border bg-surface rounded-lg border p-3 text-xs">
                <span className="text-muted border-border block border-b pb-1 font-medium">
                  Deductive Status
                </span>
                {selectedEvent.isAnalyzed ? (
                  <div className="flex items-center gap-1.5 py-1 font-medium text-teal-400">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Time Confirmed (Verified by security records)
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleConfirmTime(selectedEvent.id)}
                    className="bg-accent hover:bg-accent-hover text-accent-foreground mt-1 w-full rounded px-4 py-2 text-xs font-semibold shadow transition-colors"
                  >
                    Confirm Event Time
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-muted flex h-full flex-col items-center justify-center py-12 text-xs">
              <svg
                className="mb-2 h-8 w-8 animate-bounce opacity-30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Select timeline node to examine sequence validation
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}
