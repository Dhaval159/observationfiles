import { useState, useEffect, useCallback } from "react";
import type { CaseDefinition } from "@/types/case";
import type { EventEmitter } from "@/types/engine";
import { CaseEngine } from "../services";
import { useProgressStore } from "@/stores/progress-store";
import { getCaseProgressSummary } from "../utils";
import type { ChapterProgress, CaseObjectiveStatus } from "../types";

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

export function useCaseEngine(): CaseEngine {
  const [emitter] = useState(() => createEventEmitter());
  const [engine] = useState(() => new CaseEngine(emitter));
  return engine;
}

export function useCase(caseId: string): {
  caseDefinition: CaseDefinition | null;
  isLoading: boolean;
  error: Error | null;
  engine: CaseEngine | null;
} {
  const engine = useCaseEngine();
  const [caseDefinition, setCaseDefinition] = useState<CaseDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/cases/${caseId}`);
        if (!response.ok) {
          throw new Error(`Failed to load case: ${response.statusText}`);
        }
        const data = (await response.json()) as CaseDefinition;
        if (cancelled) return;
        engine.loadCase(data);
        setCaseDefinition(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [caseId, engine]);

  return { caseDefinition, isLoading, error, engine };
}

export function useCaseProgress(caseId: string): {
  progress: {
    chapterProgress: number;
    objectiveProgress: number;
    evidenceProgress: number;
    observationProgress: number;
    overall: number;
  } | null;
  objectives: CaseObjectiveStatus[];
  chapters: ChapterProgress[];
} {
  const engine = useCaseEngine();
  const [progress, setProgress] = useState<{
    chapterProgress: number;
    objectiveProgress: number;
    evidenceProgress: number;
    observationProgress: number;
    overall: number;
  } | null>(null);
  const [objectives, setObjectives] = useState<CaseObjectiveStatus[]>([]);
  const [chapters, setChapters] = useState<ChapterProgress[]>([]);

  const recalc = useCallback(() => {
    const caseDef = engine.getCase();
    if (!caseDef) return;

    try {
      const state = engine.getState();

      const prog = getCaseProgressSummary(state, caseDef);
      setProgress(prog);

      const allObjectives = engine.getObjectives(true);
      const objStatuses: CaseObjectiveStatus[] = allObjectives.map((o) => ({
        objectiveId: o.id,
        type: o.type,
        description: o.description,
        isComplete: state.completedObjectives.includes(o.id),
        isVisible: o.type !== "hidden" || state.hiddenDiscoveries.includes(o.id),
        isHidden: o.type === "hidden",
      }));
      setObjectives(objStatuses);

      const allChapters = engine.getChapters();
      const chProgress: ChapterProgress[] = allChapters.map((ch) => {
        const chWithObj = ch as {
          id: string;
          title: string;
          objectives?: { id: string }[];
        };
        const chapterObjIds = chWithObj.objectives?.map((o) => o.id) ?? [];
        const objectivesComplete = chapterObjIds.filter((id) =>
          state.completedObjectives.includes(id),
        ).length;
        return {
          chapterId: chWithObj.id,
          title: chWithObj.title ?? "",
          isComplete: chapterObjIds.length > 0 && objectivesComplete === chapterObjIds.length,
          objectivesComplete,
          totalObjectives: chapterObjIds.length,
        };
      });
      setChapters(chProgress);
    } catch {
      // engine state not ready yet
    }
  }, [engine]);

  useEffect(() => {
    const timer = setTimeout(recalc, 0);
    const interval = setInterval(recalc, 5000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [recalc, caseId]);

  return { progress, objectives, chapters };
}

export function useCaseUnlockStatus(caseId: string): {
  isUnlocked: boolean;
  isLoading: boolean;
  error: Error | null;
} {
  const engine = useCaseEngine();
  const completedCases = useProgressStore((s) => s.completedCases);
  const totalScore = useProgressStore((s) => s.totalScore);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(true);
      setError(null);

      try {
        const unlocked = engine.isUnlocked(caseId, {
          completedCases,
          totalScore,
        });
        setIsUnlocked(unlocked);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [caseId, engine, completedCases, totalScore]);

  return { isUnlocked, isLoading, error };
}

export { useCurrentCase } from "./use-current-case";
export { useCaseProgress as useEngineCaseProgress } from "./use-case-progress";
export { useObjectives } from "./use-objectives";
export { useCaseState } from "./use-case-state";
export { useCaseMetadata } from "./use-case-metadata";
