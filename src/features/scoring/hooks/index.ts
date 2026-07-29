import { useMemo } from "react";
import { ScoringEngine } from "../services";
import type { ScoreBreakdown, ScoringConfig } from "@/types/scoring";
import type { EventEmitter } from "@/types/engine";

const noopEmitter: EventEmitter = {
  on: () => () => {},
  off: () => {},
  emit: () => {},
  once: () => {},
  listenerCount: () => 0,
};

let engineInstance: ScoringEngine | null = null;

export function useScoringEngine(
  emitter: EventEmitter = noopEmitter,
  config?: ScoringConfig,
): ScoringEngine {
  return useMemo(() => {
    if (!engineInstance) {
      engineInstance = new ScoringEngine(emitter, config);
    }
    return engineInstance;
  }, [emitter, config]);
}

export function useScoreBreakdown(): ScoreBreakdown {
  const engine = useScoringEngine();
  return engine.getCurrentScores();
}

export function useScoreProgress(): { current: number; max: number; percentage: number } {
  const engine = useScoringEngine();
  return engine.getProgress();
}

export function useFinalScore() {
  const engine = useScoringEngine();
  return {
    getTotalScore: () => engine.getTotalScore(),
    isPassing: () => engine.isPassing(),
    finalizeScore: () => engine.finalizeScore(),
    getHintsUsed: () => engine.getHintsUsed(),
    getWrongAccusations: () => engine.getWrongAccusations(),
  };
}

export function useTimeBonus(): { bonus: number; elapsedMinutes: number } {
  const engine = useScoringEngine();
  return {
    bonus: engine.getCurrentScores().timeBonus,
    elapsedMinutes: engine.getTimeElapsed(),
  };
}
