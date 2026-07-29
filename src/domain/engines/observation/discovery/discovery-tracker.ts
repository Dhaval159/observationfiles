import type { ObservationDiscoveryEntry, ObservationContext, ObservationLifecycleState } from "../types";
import type { DomainTimestamp } from "@/domain/value-objects/timestamp";
import { generateUuid } from "@/domain/utils/id-generator";
import { now } from "@/domain/value-objects/timestamp";

export class DiscoveryTracker {
  private _history: ObservationDiscoveryEntry[] = [];
  private readonly _maxEntries: number;

  constructor(maxEntries: number = 1000) {
    this._maxEntries = maxEntries;
  }

  record(
    observationId: string,
    locationId: string,
    playerAction: string,
    source: string,
    previousState: ObservationLifecycleState,
    newState: ObservationLifecycleState,
    metadata?: Record<string, unknown>,
    timestamp?: DomainTimestamp,
  ): ObservationDiscoveryEntry {
    const entry: ObservationDiscoveryEntry = {
      id: generateUuid(),
      observationId,
      discoveredAt: timestamp ?? now(),
      locationId,
      playerAction,
      source,
      previousState,
      newState,
      metadata: metadata ?? {},
    };

    this._history.push(entry);
    this._pruneOldEntries();

    return entry;
  }

  getHistory(): ObservationDiscoveryEntry[] {
    return [...this._history];
  }

  getHistoryForObservation(observationId: string): ObservationDiscoveryEntry[] {
    return this._history.filter((e) => e.observationId === observationId);
  }

  getRecent(limit: number = 10): ObservationDiscoveryEntry[] {
    return this._history.slice(-limit).reverse();
  }

  getByState(state: ObservationLifecycleState): ObservationDiscoveryEntry[] {
    return this._history.filter((e) => e.newState === state);
  }

  getByLocation(locationId: string): ObservationDiscoveryEntry[] {
    return this._history.filter((e) => e.locationId === locationId);
  }

  getFirstDiscovery(observationId: string): ObservationDiscoveryEntry | undefined {
    return this._history.find((e) => e.observationId === observationId);
  }

  getLastDiscovery(observationId: string): ObservationDiscoveryEntry | undefined {
    const entries = this.getHistoryForObservation(observationId);
    return entries[entries.length - 1];
  }

  getDiscoveryCount(observationId: string): number {
    return this.getHistoryForObservation(observationId).length;
  }

  getTimeline(): ObservationDiscoveryEntry[] {
    return [...this._history].sort((a, b) => a.discoveredAt.unix - b.discoveredAt.unix);
  }

  replay(
    handler: (entry: ObservationDiscoveryEntry) => void | Promise<void>,
  ): void {
    const timeline = this.getTimeline();
    for (const entry of timeline) {
      handler(entry);
    }
  }

  snapshot(): ObservationDiscoveryEntry[] {
    return this.getTimeline();
  }

  restore(snapshot: ObservationDiscoveryEntry[]): void {
    this._history = [...snapshot].sort(
      (a, b) => a.discoveredAt.unix - b.discoveredAt.unix,
    );
  }

  syncToContext(ctx: ObservationContext): void {
    ctx.discoveryHistory = this.getTimeline();
  }

  syncFromContext(ctx: ObservationContext): void {
    this._history = [...ctx.discoveryHistory].sort(
      (a, b) => a.discoveredAt.unix - b.discoveredAt.unix,
    );
  }

  clear(): void {
    this._history = [];
  }

  get count(): number {
    return this._history.length;
  }

  private _pruneOldEntries(): void {
    if (this._history.length > this._maxEntries) {
      const excess = this._history.length - this._maxEntries;
      this._history = this._history.slice(excess);
    }
  }
}
