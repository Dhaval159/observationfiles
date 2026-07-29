import { create } from "zustand";
import { useEffect, useMemo, useState, useRef } from "react";
import type { EventEmitter } from "@/types/engine";
import type {
  ObservationDefinition,
  ObservationState,
  ObservationSearchCriteria,
} from "@/types/observation";
import { ObservationEngine } from "../services";
import type { ObservationEngineState, ObservationFilterResult } from "../types";

interface EngineStore {
  engine: ObservationEngine | null;
  state: ObservationEngineState | null;
  version: number;
  bump: () => void;
  setEngine: (engine: ObservationEngine) => void;
  refreshState: (state: ObservationEngineState) => void;
}

const useObservationEngineStore = create<EngineStore>((set) => ({
  engine: null,
  state: null,
  version: 0,
  bump: () => set((s) => ({ version: s.version + 1 })),
  setEngine: (engine: ObservationEngine) => set({ engine, state: engine.getState() }),
  refreshState: (state: ObservationEngineState) => set((s) => ({ state, version: s.version + 1 })),
}));

let engineInstance: ObservationEngine | null = null;
let emitterInstance: EventEmitter | null = null;

function createEventEmitter(): EventEmitter {
  const listeners = new Map<string, Set<(...args: unknown[]) => void>>();

  return {
    on(event: string, handler: (...args: unknown[]) => void): () => void {
      if (!listeners.has(event)) listeners.set(event, new Set());
      const handlers = listeners.get(event);
      if (handlers) handlers.add(handler);
      return () => {
        const h = listeners.get(event);
        if (h) h.delete(handler);
      };
    },
    off(event: string, handler: (...args: unknown[]) => void): void {
      const handlers = listeners.get(event);
      if (handlers) handlers.delete(handler);
    },
    emit(event: string, ...args: unknown[]): void {
      const handlers = listeners.get(event);
      if (handlers) {
        for (const handler of handlers) {
          handler(...args);
        }
      }
    },
    once(event: string, handler: (...args: unknown[]) => void): void {
      const wrapper = (...args: unknown[]) => {
        handler(...args);
        const handlers = listeners.get(event);
        if (handlers) handlers.delete(wrapper);
      };
      const handlers = listeners.get(event);
      if (!handlers) {
        listeners.set(event, new Set([wrapper]));
      } else {
        handlers.add(wrapper);
      }
    },
    listenerCount(event: string): number {
      const handlers = listeners.get(event);
      return handlers?.size ?? 0;
    },
  };
}

function ensureEngine(): ObservationEngine {
  if (!engineInstance) {
    emitterInstance = createEventEmitter();
    engineInstance = new ObservationEngine(emitterInstance);

    const refresh = () => {
      if (engineInstance) {
        useObservationEngineStore.getState().refreshState(engineInstance.getState());
      }
    };

    emitterInstance.on("observation_discovered", refresh);
    emitterInstance.on("observation_analyzed", refresh);

    useObservationEngineStore.getState().setEngine(engineInstance);
  }
  return engineInstance;
}

export function useObservationEngine(): ObservationEngine {
  const { engine } = useObservationEngineStore();
  const engineRef = useRef<ObservationEngine | null>(null);

  if (!engineRef.current) {
    engineRef.current = engine ?? ensureEngine();
  }

  useEffect(() => {
    const current = ensureEngine();
    useObservationEngineStore.getState().setEngine(current);
    engineRef.current = current;
  }, []);

  return engineRef.current;
}

export function useObservationsAtLocation(locationId: string): {
  objects: Array<{
    objectId: string;
    name: string;
    observationIds: string[];
    observations: ObservationDefinition[];
    states: (ObservationState | null)[];
  }>;
} {
  const engine = useObservationEngine();
  const { version } = useObservationEngineStore();

  return useMemo(() => {
    const objects = engine.getObjectsAtLocation(locationId);

    return {
      objects: objects.map((obj) => {
        const observations = engine.getObservationsForObject(obj.id);
        const states = observations.map((obs) => engine.getObservationState(obs.id));

        return {
          objectId: obj.id,
          name: obj.name,
          observationIds: obj.observationIds,
          observations,
          states,
        };
      }),
    };
  }, [engine, locationId, version]);
}

export function useObservation(observationId: string): {
  definition: ObservationDefinition | null;
  state: ObservationState | null;
} {
  const engine = useObservationEngine();
  const { version } = useObservationEngineStore();

  return useMemo(() => {
    const definition = engine.getState().observations.get(observationId) ?? null;
    const state = engine.getObservationState(observationId);

    return { definition, state };
  }, [engine, observationId, version]);
}

export function useObservationSearch(criteria: ObservationSearchCriteria): ObservationFilterResult {
  const engine = useObservationEngine();
  const criteriaKey = JSON.stringify(criteria);
  const [result, setResult] = useState<ObservationFilterResult>({
    observations: [],
    total: 0,
    filtered: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setResult(engine.search(criteria));
    }, 300);

    return () => clearTimeout(timer);
  }, [engine, criteriaKey]);

  return result;
}

export function useObservationProgress(): {
  discovered: number;
  total: number;
  percentage: number;
  analyzed: number;
  analyzedPercentage: number;
} {
  const engine = useObservationEngine();
  const { version } = useObservationEngineStore();

  return useMemo(() => {
    return engine.getDiscoveryProgress();
  }, [engine, version]);
}

export function useDiscoverableObservations(
  context: Record<string, unknown>,
): ObservationDefinition[] {
  const engine = useObservationEngine();
  const contextKey = JSON.stringify(context);
  const { version } = useObservationEngineStore();

  return useMemo(() => {
    return engine.getDiscoverableObservations(context);
  }, [engine, contextKey, version]);
}
