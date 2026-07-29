import { useState, useEffect, useCallback } from "react";
import type { EventEmitter } from "@/types/engine";
import type {
  InvestigationState,
  InvestigationPhase,
  InvestigationAction,
} from "@/types/investigation";
import { InvestigationEngine } from "../services";
import { getPhaseOrder } from "../utils";

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

export function useInvestigationEngine(): InvestigationEngine {
  const [engine] = useState(() => new InvestigationEngine(createEventEmitter()));
  return engine;
}

export function useInvestigation(caseId: string): {
  state: InvestigationState | null;
  engine: InvestigationEngine;
  start: (userId: string) => void;
  isLoading: boolean;
  error: Error | null;
} {
  const engine = useInvestigationEngine();
  const [state, setState] = useState<InvestigationState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const start = useCallback(
    (userId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const newState = engine.startInvestigation(caseId, userId);
        setState(newState);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    },
    [caseId, engine],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        setState(engine.getState());
      } catch {
        // state not ready
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [engine]);

  return { state, engine, start, isLoading, error };
}

export function useInvestigationPhase(): {
  phase: InvestigationPhase | null;
  phaseIndex: number;
  canAdvance: (to: InvestigationPhase) => boolean;
  allPhases: InvestigationPhase[];
} {
  const engine = useInvestigationEngine();
  const [phase, setPhase] = useState<InvestigationPhase | null>(null);

  useEffect(() => {
    const update = () => {
      try {
        setPhase(engine.getState().phase);
      } catch {
        // state not ready
      }
    };
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, [engine]);

  const canAdvance = useCallback(
    (to: InvestigationPhase) => engine.canAdvanceToPhase(to),
    [engine],
  );

  return {
    phase,
    phaseIndex: phase !== null ? getPhaseOrder(phase) : -1,
    canAdvance,
    allPhases: [
      "briefing",
      "scene_examination",
      "evidence_collection",
      "witness_interviews",
      "analysis",
      "interrogation",
      "theory_construction",
      "confrontation",
      "resolution",
      "complete",
    ],
  };
}

export function useInvestigationProgress(): {
  percentage: number;
  isLoading: boolean;
} {
  const engine = useInvestigationEngine();
  const [percentage, setPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const update = () => {
      try {
        setPercentage(engine.getCompletionPercentage());
        setIsLoading(false);
      } catch {
        setIsLoading(true);
      }
    };
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, [engine]);

  return { percentage, isLoading };
}

export function useInvestigationActions(): {
  availableActions: InvestigationAction[];
  isLoading: boolean;
} {
  const engine = useInvestigationEngine();
  const [availableActions, setAvailableActions] = useState<InvestigationAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const update = () => {
      try {
        setAvailableActions(engine.getAvailableActions());
        setIsLoading(false);
      } catch {
        setIsLoading(true);
      }
    };
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, [engine]);

  return { availableActions, isLoading };
}

export function useLocationState(): {
  currentLocationId: string | null;
  isLoading: boolean;
} {
  const engine = useInvestigationEngine();
  const [currentLocationId, setCurrentLocationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const update = () => {
      try {
        const state = engine.getState();
        setCurrentLocationId(state.currentLocation || null);
        setIsLoading(false);
      } catch {
        setIsLoading(true);
      }
    };
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, [engine]);

  return { currentLocationId, isLoading };
}

// Domain engine hooks
export { useInvestigation as useDomainInvestigation } from "./use-investigation";
export { useDiscoveries } from "./use-discoveries";
export { useCurrentLocation } from "./use-current-location";
export { useInvestigationProgress as useDomainInvestigationProgress } from "./use-investigation-progress";
export {
  useInvestigationHistory,
  useInvestigationLog,
  useNotifications,
} from "./use-investigation-history";
