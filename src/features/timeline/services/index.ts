import type { EventEmitter } from "@/types/engine";
import type {
  FullTimelineEvent,
  TimelineConflict,
  TimelineEventDependency,
} from "@/types/timeline";
import type {
  TimelineEngineState,
  TimelineEventPlacement,
  TimelineValidationReport,
} from "../types";
import {
  detectTimeOverlap,
  detectDependencyViolation,
  eventsAreContradictory,
  calculateTimelineGap,
  sortEventsByOrder,
} from "../utils";

export class TimelineEngine {
  readonly id: string;
  readonly name = "TimelineEngine";

  private state: TimelineEngineState;
  private emitter: EventEmitter;

  constructor(emitter: EventEmitter) {
    this.id = `timeline-engine-${Math.random().toString(36).slice(2, 9)}`;
    this.emitter = emitter;
    this.state = {
      events: new Map(),
      eventOrder: [],
      conflicts: [],
      validationErrors: [],
      isDirty: false,
    };
  }

  loadEvents(events: FullTimelineEvent[]): void {
    this.state.events = new Map();
    this.state.eventOrder = [];
    this.state.conflicts = [];
    this.state.validationErrors = [];
    this.state.isDirty = false;

    for (const event of events) {
      this.state.events.set(event.id, { ...event });
    }

    this.state.eventOrder = sortEventsByOrder(events).map((e) => e.id);
    this.emitter.emit("events_loaded", { count: events.length });
  }

  getAllEvents(): FullTimelineEvent[] {
    return Array.from(this.state.events.values());
  }

  getEvent(eventId: string): FullTimelineEvent | null {
    return this.state.events.get(eventId) ?? null;
  }

  getOrderedEvents(): FullTimelineEvent[] {
    return this.state.eventOrder
      .map((id) => this.state.events.get(id))
      .filter((e): e is FullTimelineEvent => e != null);
  }

  addEvent(event: FullTimelineEvent): void {
    this.state.events.set(event.id, { ...event });
    this.state.eventOrder.push(event.id);
    this.state.isDirty = true;
    this.emitter.emit("event_added", { eventId: event.id });
    this.emitter.emit("timeline_changed");
  }

  removeEvent(eventId: string): void {
    this.state.events.delete(eventId);
    this.state.eventOrder = this.state.eventOrder.filter((id) => id !== eventId);
    this.state.conflicts = this.state.conflicts.filter(
      (c) => c.eventA !== eventId && c.eventB !== eventId,
    );
    this.state.isDirty = true;
    this.emitter.emit("event_removed", { eventId });
    this.emitter.emit("timeline_changed");
  }

  discoverEvent(eventId: string): void {
    const event = this.state.events.get(eventId);
    if (!event) return;
    event.isDiscovered = true;
    this.state.isDirty = true;
    this.emitter.emit("event_discovered", { eventId });
    this.emitter.emit("timeline_changed");
  }

  analyzeEvent(eventId: string): void {
    const event = this.state.events.get(eventId);
    if (!event) return;
    event.isAnalyzed = true;
    this.state.isDirty = true;
    this.emitter.emit("event_analyzed", { eventId });
  }

  moveEvent(eventId: string, newIndex: number): TimelineEventPlacement {
    const event = this.state.events.get(eventId);
    if (!event) {
      return {
        eventId,
        newIndex,
        isValid: false,
        conflicts: [],
      };
    }

    const currentIndex = this.state.eventOrder.indexOf(eventId);
    if (currentIndex === -1) {
      return { eventId, newIndex, isValid: false, conflicts: [] };
    }

    const clampedIndex = Math.max(0, Math.min(newIndex, this.state.eventOrder.length - 1));

    const newOrder = [...this.state.eventOrder];
    newOrder.splice(currentIndex, 1);
    newOrder.splice(clampedIndex, 0, eventId);

    const conflicts: TimelineConflict[] = [];
    let isValid = true;

    if (detectDependencyViolation(event, newOrder, this.state.events)) {
      isValid = false;
      conflicts.push({
        eventA: eventId,
        eventB: "",
        conflictType: "impossibility",
        resolutionNotes: "Dependency violation: cannot move event before its prerequisites",
      });
    }

    const adjacentIds = this.getAdjacentEvents(eventId, newOrder);
    for (const adjId of adjacentIds) {
      const adj = this.state.events.get(adjId);
      if (!adj) continue;
      if (detectTimeOverlap(event, adj)) {
        conflicts.push({
          eventA: eventId,
          eventB: adjId,
          conflictType: "overlap",
          resolutionNotes: null,
        });
        isValid = false;
      }
      if (eventsAreContradictory(event, adj)) {
        conflicts.push({
          eventA: eventId,
          eventB: adjId,
          conflictType: "contradiction",
          resolutionNotes: null,
        });
        isValid = false;
      }
    }

    this.state.eventOrder = newOrder;
    event.order = clampedIndex;
    this.state.isDirty = true;

    this.emitter.emit("event_moved", { eventId, from: currentIndex, to: clampedIndex, conflicts });
    this.emitter.emit("timeline_changed");

    return {
      eventId,
      newIndex: clampedIndex,
      isValid,
      conflicts,
    };
  }

  reorderEvents(eventIds: string[]): TimelineEventPlacement[] {
    return eventIds.map((id, index) => this.moveEvent(id, index));
  }

  confirmEventTime(eventId: string): void {
    const event = this.state.events.get(eventId);
    if (!event || !event.estimation) return;

    event.estimation.confirmedTime = event.estimation.estimatedTime;
    event.certainty = "confirmed";
    this.state.isDirty = true;
    this.emitter.emit("event_time_confirmed", { eventId });
  }

  setEventTime(eventId: string, time: string, isConfirmed: boolean): void {
    const event = this.state.events.get(eventId);
    if (!event) return;

    if (!event.estimation) {
      event.estimation = {
        estimatedTime: time,
        confirmedTime: isConfirmed ? time : null,
        uncertaintyMinutes: null,
        estimatedBy: null,
        confirmedBy: null,
      };
    } else {
      if (isConfirmed) {
        event.estimation.confirmedTime = time;
        event.estimation.estimatedTime = time;
      } else {
        event.estimation.estimatedTime = time;
      }
    }

    if (isConfirmed) {
      event.certainty = "confirmed";
    }

    this.state.isDirty = true;
    this.emitter.emit("event_time_set", { eventId, time, isConfirmed });
  }

  getConflicts(): TimelineConflict[] {
    return [...this.state.conflicts];
  }

  detectConflicts(): TimelineConflict[] {
    const newConflicts: TimelineConflict[] = [];
    const eventIds = Array.from(this.state.events.keys());

    for (let i = 0; i < eventIds.length; i++) {
      for (let j = i + 1; j < eventIds.length; j++) {
        const idA = eventIds[i];
        const idB = eventIds[j];
        if (idA === undefined || idB === undefined) continue;
        const eventA = this.state.events.get(idA);
        const eventB = this.state.events.get(idB);
        if (!eventA || !eventB) continue;

        if (detectTimeOverlap(eventA, eventB)) {
          newConflicts.push({
            eventA: eventA.id,
            eventB: eventB.id,
            conflictType: "overlap",
            resolutionNotes: null,
          });
        }

        if (eventsAreContradictory(eventA, eventB)) {
          newConflicts.push({
            eventA: eventA.id,
            eventB: eventB.id,
            conflictType: "contradiction",
            resolutionNotes: null,
          });
        }
      }
    }

    for (const event of this.state.events.values()) {
      if (detectDependencyViolation(event, this.state.eventOrder, this.state.events)) {
        newConflicts.push({
          eventA: event.id,
          eventB: "",
          conflictType: "impossibility",
          resolutionNotes: "Dependency violation detected",
        });
      }
    }

    this.state.conflicts = newConflicts;
    this.emitter.emit("conflicts_detected", { conflicts: newConflicts });

    return newConflicts;
  }

  resolveConflict(conflictId: string, resolution: string): void {
    this.state.conflicts = this.state.conflicts.filter((c) => {
      const id = `${c.eventA}-${c.eventB}-${c.conflictType}`;
      return id !== conflictId;
    });
    this.state.isDirty = true;
    this.emitter.emit("conflict_resolved", { conflictId, resolution });
  }

  getUnresolvedConflicts(): TimelineConflict[] {
    return this.state.conflicts;
  }

  validate(): TimelineValidationReport {
    const errors: typeof this.state.validationErrors = [];
    const warnings: typeof this.state.validationErrors = [];
    const suggestions: string[] = [];

    for (const event of this.state.events.values()) {
      if (event.isDiscovered) {
        const hasValidTime = event.estimation?.confirmedTime ?? event.estimation?.estimatedTime;

        if (!hasValidTime && !event.timestamp) {
          errors.push({
            eventId: event.id,
            error: "time_conflict",
            message: `Event "${event.title}" has no valid timestamp`,
          });
          suggestions.push(`Set a time for: ${event.title}`);
        }
      }

      if (detectDependencyViolation(event, this.state.eventOrder, this.state.events)) {
        errors.push({
          eventId: event.id,
          error: "impossible_order",
          message: `Event "${event.title}" violates dependency ordering`,
        });
        suggestions.push(`Reorder: ${event.title} to satisfy dependencies`);
      }

      if (hasCircularDependency(event.id, this.state.events)) {
        errors.push({
          eventId: event.id,
          error: "circular_dependency",
          message: `Event "${event.title}" has circular dependencies`,
        });
        suggestions.push(`Resolve circular dependencies for: ${event.title}`);
      }
    }

    for (let i = 0; i < this.state.eventOrder.length - 1; i++) {
      const idA = this.state.eventOrder[i];
      const idB = this.state.eventOrder[i + 1];
      if (idA === undefined || idB === undefined) continue;
      const eventA = this.state.events.get(idA);
      const eventB = this.state.events.get(idB);
      if (!eventA || !eventB) continue;

      if (detectTimeOverlap(eventA, eventB)) {
        const aCertainty = eventA.certainty;
        const bCertainty = eventB.certainty;
        if (aCertainty === "confirmed" && bCertainty === "confirmed") {
          errors.push({
            eventId: eventA.id,
            error: "time_conflict",
            message: `Confirmed events "${eventA.title}" and "${eventB.title}" overlap in time`,
          });
          suggestions.push(`Resolve time overlap between "${eventA.title}" and "${eventB.title}"`);
        } else {
          warnings.push({
            eventId: eventA.id,
            error: "time_conflict",
            message: `Events "${eventA.title}" and "${eventB.title}" may overlap in time`,
          });
        }
      }
    }

    this.state.validationErrors = [...errors, ...warnings];

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  getDiscoveredEvents(): FullTimelineEvent[] {
    return this.getOrderedEvents().filter((e) => e.isDiscovered);
  }

  getUndiscoveredEvents(): FullTimelineEvent[] {
    return this.getOrderedEvents().filter((e) => !e.isDiscovered);
  }

  getEventsAtTime(time: string): FullTimelineEvent[] {
    const target = new Date(time).getTime();
    if (isNaN(target)) return [];

    return this.getOrderedEvents().filter((event) => {
      const eventTime =
        event.estimation?.confirmedTime ?? event.estimation?.estimatedTime ?? event.timestamp;
      const et = new Date(eventTime).getTime();
      if (isNaN(et)) return false;

      const durationMs = (event.duration ?? 0) * 60 * 1000;
      return et <= target && target <= et + durationMs;
    });
  }

  getEventsByParticipant(npcId: string): FullTimelineEvent[] {
    return this.getOrderedEvents().filter((e) => e.participants.includes(npcId));
  }

  getEventsByLocation(locationId: string): FullTimelineEvent[] {
    return this.getOrderedEvents().filter((e) => e.location === locationId);
  }

  getTimelineGaps(): {
    before: FullTimelineEvent;
    after: FullTimelineEvent;
    gapMinutes: number;
  }[] {
    const ordered = this.getOrderedEvents();
    const gaps: {
      before: FullTimelineEvent;
      after: FullTimelineEvent;
      gapMinutes: number;
    }[] = [];

    for (let i = 0; i < ordered.length - 1; i++) {
      const eventA = ordered[i]!;
      const eventB = ordered[i + 1]!;
      const gap = calculateTimelineGap(eventA, eventB);
      if (gap > 0) {
        gaps.push({ before: eventA, after: eventB, gapMinutes: gap });
      }
    }

    return gaps;
  }

  getTimelineProgress(): {
    discovered: number;
    total: number;
    percentage: number;
    confirmed: number;
    eventsWithCorrectTime: number;
  } {
    const total = this.state.events.size;
    const discovered = this.getDiscoveredEvents().length;
    const confirmed = this.getOrderedEvents().filter(
      (e) => e.estimation?.confirmedTime != null,
    ).length;
    const eventsWithCorrectTime = this.getOrderedEvents().filter(
      (e) => e.estimation?.confirmedTime != null || e.certainty === "confirmed",
    ).length;

    return {
      discovered,
      total,
      percentage: total > 0 ? (discovered / total) * 100 : 0,
      confirmed,
      eventsWithCorrectTime,
    };
  }

  pinEvent(eventId: string): void {
    this.emitter.emit("event_pinned", { eventId });
  }

  unpinEvent(eventId: string): void {
    this.emitter.emit("event_unpinned", { eventId });
  }

  getPinnedEvents(): FullTimelineEvent[] {
    return this.getOrderedEvents().filter((e) => {
      const pinned = (this.emitter as unknown as Record<string, unknown>)["_pinnedEvents"] as
        Set<string> | undefined;
      return pinned?.has(e.id) ?? false;
    });
  }

  updatePlayerNotes(eventId: string, notes: string): void {
    const event = this.state.events.get(eventId);
    if (!event) return;
    event.notes = notes;
    this.state.isDirty = true;
    this.emitter.emit("event_notes_updated", { eventId });
  }

  getEventDependencies(eventId: string): TimelineEventDependency[] {
    const event = this.state.events.get(eventId);
    return event?.dependencies ?? [];
  }

  serialize(): string {
    const serializable = {
      events: Array.from(this.state.events.entries()),
      eventOrder: this.state.eventOrder,
      conflicts: this.state.conflicts,
      validationErrors: this.state.validationErrors,
      isDirty: this.state.isDirty,
    };
    return JSON.stringify(serializable);
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.state.events = new Map(parsed.events);
    this.state.eventOrder = parsed.eventOrder;
    this.state.conflicts = parsed.conflicts;
    this.state.validationErrors = parsed.validationErrors;
    this.state.isDirty = false;
    this.emitter.emit("timeline_deserialized");
  }

  reset(): void {
    this.state = {
      events: new Map(),
      eventOrder: [],
      conflicts: [],
      validationErrors: [],
      isDirty: false,
    };
    this.emitter.emit("timeline_reset");
  }

  private getAdjacentEvents(eventId: string, order: string[]): string[] {
    const index = order.indexOf(eventId);
    if (index === -1) return [];
    const adjacent: string[] = [];
    const prev = order[index - 1];
    const next = order[index + 1];
    if (index > 0 && prev !== undefined) adjacent.push(prev);
    if (index < order.length - 1 && next !== undefined) adjacent.push(next);
    return adjacent;
  }
}

function hasCircularDependency(startId: string, events: Map<string, FullTimelineEvent>): boolean {
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function dfs(id: string): boolean {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;

    visiting.add(id);
    const deps = events.get(id)?.dependencies;
    if (deps) {
      for (const dep of deps) {
        if (dep.dependencyType === "requires" || dep.dependencyType === "precedes") {
          if (dfs(dep.dependsOn)) return true;
        }
      }
    }
    visiting.delete(id);
    visited.add(id);
    return false;
  }

  return dfs(startId);
}
