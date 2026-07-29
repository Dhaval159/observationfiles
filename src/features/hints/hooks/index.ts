import { useRef, useState, useEffect, useCallback } from "react";
import type { EventEmitter } from "@/types/engine";
import type { HintCategory, HintLevel } from "@/types/hint";
import type { HintEligibilityContext, HintEvaluation, HintState } from "../types";
import { HintEngine } from "../services";

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

export function useHintEngine(): HintEngine {
  const emitterRef = useRef<EventEmitter | null>(null);
  const engineRef = useRef<HintEngine | null>(null);

  if (!emitterRef.current) {
    emitterRef.current = createEventEmitter();
  }
  if (!engineRef.current) {
    engineRef.current = new HintEngine(emitterRef.current);
  }

  return engineRef.current;
}

export function useAvailableHints(context: HintEligibilityContext): {
  hints: HintEvaluation[];
  isLoading: boolean;
  refresh: () => void;
} {
  const engine = useHintEngine();
  const [hints, setHints] = useState<HintEvaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    try {
      setHints(engine.getAvailableHints(context));
      setIsLoading(false);
    } catch {
      setIsLoading(true);
    }
  }, [engine, context]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { hints, isLoading, refresh };
}

export function useRevealedHints(): {
  hints: HintState[];
  isLoading: boolean;
} {
  const engine = useHintEngine();
  const [hints, setHints] = useState<HintState[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const update = () => {
      try {
        setHints(engine.getRevealedHints());
        setIsLoading(false);
      } catch {
        setIsLoading(true);
      }
    };
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, [engine]);

  return { hints, isLoading };
}

export function useHintRequest(
  caseId: string,
  category?: HintCategory,
  targetId?: string,
): {
  requestHint: (context: HintEligibilityContext) => HintEvaluation | null;
  revealHint: (hintId: string, level: HintLevel) => HintState;
  isRequesting: boolean;
} {
  const engine = useHintEngine();
  const [isRequesting, setIsRequesting] = useState(false);

  const requestHint = useCallback(
    (context: HintEligibilityContext): HintEvaluation | null => {
      setIsRequesting(true);
      try {
        return engine.requestHint({ caseId, category, targetId, context });
      } finally {
        setIsRequesting(false);
      }
    },
    [engine, caseId, category, targetId],
  );

  const revealHint = useCallback(
    (hintId: string, level: HintLevel): HintState => {
      return engine.revealHint(hintId, level);
    },
    [engine],
  );

  return { requestHint, revealHint, isRequesting };
}

export function useHintStatus(): {
  hintsRemaining: number;
  freeHintsRemaining: number;
  totalPenalty: number;
  canRequestHint: boolean;
  isLoading: boolean;
} {
  const engine = useHintEngine();
  const [hintsRemaining, setHintsRemaining] = useState(0);
  const [freeHintsRemaining, setFreeHintsRemaining] = useState(0);
  const [totalPenalty, setTotalPenalty] = useState(0);
  const [canRequestHint, setCanRequestHint] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const update = useCallback(() => {
    try {
      setHintsRemaining(engine.getHintsRemaining());
      setFreeHintsRemaining(engine.getFreeHintsRemaining());
      setTotalPenalty(engine.getHintPenalty());
      setCanRequestHint(engine.canRequestHint());
      setIsLoading(false);
    } catch {
      setIsLoading(true);
    }
  }, [engine]);

  useEffect(() => {
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, [update]);

  return { hintsRemaining, freeHintsRemaining, totalPenalty, canRequestHint, isLoading };
}
