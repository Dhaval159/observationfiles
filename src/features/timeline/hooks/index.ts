import { useState, useEffect, useCallback, useMemo } from "react";
import type { EventEmitter } from "@/types/engine";
import type { FullTimelineEvent, TimelineEventDependency } from "@/types/timeline";
import type { TimelineValidationReport } from "../types";
import { TimelineEngine } from "../services";

import { poisonedPinotCase } from "../../cases/data/poisoned-pinot";

function createEventEmitter(): EventEmitter {
  const listeners = new Map<string, Set<(...args: unknown[]) => void>>();
  return {
    on(event: string, handler: (...args: unknown[]) => void): () => void {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(handler);
      return () => {
        listeners.get(event)?.delete(handler);
      };
    },
    off(event: string, handler: (...args: unknown[]) => void): void {
      listeners.get(event)?.delete(handler);
    },
    emit(event: string, ...args: unknown[]): void {
      listeners.get(event)?.forEach((handler) => handler(...args));
    },
    once(event: string, handler: (...args: unknown[]) => void): void {
      const wrapper = (...args: unknown[]) => {
        handler(...args);
        listeners.get(event)?.delete(wrapper);
      };
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(wrapper);
    },
    listenerCount(event: string): number {
      return listeners.get(event)?.size ?? 0;
    },
  };
}

let emitterInstance: EventEmitter | null = null;
let engineInstance: TimelineEngine | null = null;

export function getTimelineEmitter(): EventEmitter {
  if (!emitterInstance) {
    emitterInstance = createEventEmitter();
  }
  return emitterInstance;
}

export function getTimelineEngine(): TimelineEngine {
  if (!engineInstance) {
    const emitter = getTimelineEmitter();
    engineInstance = new TimelineEngine(emitter);

    // Register Poisoned Pinot timeline events
    engineInstance.loadEvents(poisonedPinotCase.timelineEvents);
  }
  return engineInstance;
}

export function useTimelineEngine(): TimelineEngine {
  return useMemo(() => getTimelineEngine(), []);
}

export function useTimelineEvents(): {
  events: FullTimelineEvent[];
  orderedEvents: FullTimelineEvent[];
  refresh: () => void;
} {
  const engine = useTimelineEngine();
  const [, setTick] = useState(0);

  const refresh = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    const emitter = getTimelineEmitter();
    const unsub1 = emitter.on("event_added", refresh);
    const unsub2 = emitter.on("event_removed", refresh);
    const unsub3 = emitter.on("timeline_changed", refresh);
    const unsub4 = emitter.on("timeline_deserialized", refresh);
    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
    };
  }, [engine, refresh]);

  const events = useMemo(() => engine.getAllEvents(), [engine]);
  const orderedEvents = useMemo(() => engine.getOrderedEvents(), [engine]);

  return { events, orderedEvents, refresh };
}

export function useTimeline(eventId: string): {
  event: FullTimelineEvent | null;
  dependencies: TimelineEventDependency[];
} {
  const engine = useTimelineEngine();
  const [, setTick] = useState(0);

  const refresh = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    const emitter = getTimelineEmitter();
    const unsub1 = emitter.on("event_moved", refresh);
    const unsub2 = emitter.on("event_discovered", refresh);
    const unsub3 = emitter.on("event_analyzed", refresh);
    const unsub4 = emitter.on("event_time_set", refresh);
    const unsub5 = emitter.on("event_time_confirmed", refresh);
    const unsub6 = emitter.on("event_notes_updated", refresh);
    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
      unsub5();
      unsub6();
    };
  }, [engine, refresh]);

  const event = useMemo(() => engine.getEvent(eventId), [engine, eventId]);
  const dependencies = useMemo(() => engine.getEventDependencies(eventId), [engine, eventId]);

  return { event, dependencies };
}

export function useTimelineConflicts(): {
  conflicts: ReturnType<TimelineEngine["getConflicts"]>;
  unresolvedConflicts: ReturnType<TimelineEngine["getUnresolvedConflicts"]>;
} {
  const engine = useTimelineEngine();
  const [, setTick] = useState(0);

  const refresh = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    const emitter = getTimelineEmitter();
    const unsub1 = emitter.on("conflicts_detected", refresh);
    const unsub2 = emitter.on("conflict_resolved", refresh);
    const unsub3 = emitter.on("timeline_changed", refresh);
    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [engine, refresh]);

  const conflicts = useMemo(() => engine.getConflicts(), [engine]);
  const unresolvedConflicts = useMemo(() => engine.getUnresolvedConflicts(), [engine]);

  return { conflicts, unresolvedConflicts };
}

export function useTimelineValidation(): {
  report: TimelineValidationReport | null;
  validate: () => TimelineValidationReport;
} {
  const engine = useTimelineEngine();
  const [report, setReport] = useState<TimelineValidationReport | null>(null);

  const validate = useCallback(() => {
    const result = engine.validate();
    setReport(result);
    return result;
  }, [engine]);

  return { report, validate };
}

export function useTimelineProgress(): {
  progress: ReturnType<TimelineEngine["getTimelineProgress"]>;
  refresh: () => void;
} {
  const engine = useTimelineEngine();
  const [, setTick] = useState(0);

  const refresh = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    const emitter = getTimelineEmitter();
    const unsub1 = emitter.on("event_discovered", refresh);
    const unsub2 = emitter.on("event_time_confirmed", refresh);
    const unsub3 = emitter.on("event_added", refresh);
    const unsub4 = emitter.on("event_removed", refresh);
    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
    };
  }, [engine, refresh]);

  const progress = useMemo(() => engine.getTimelineProgress(), [engine]);

  return { progress, refresh };
}
