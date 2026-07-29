import type {
  ScoreBreakdown,
  ScoringRule,
  ScoringConfig,
  ScoreResult,
  StarRating,
  ScoringCondition,
} from "@/types/scoring";

export interface ScoringEngineState {
  config: ScoringConfig;
  currentScores: ScoreBreakdown;
  hintsUsed: number;
  wrongAccusations: number;
  startTime: string;
  completionTime: string | null;
  isComplete: boolean;
}

export interface ScoreUpdateEvent {
  category: keyof ScoreBreakdown;
  oldValue: number;
  newValue: number;
  delta: number;
  reason: string;
}

export type {
  ScoreBreakdown,
  ScoringRule,
  ScoringConfig,
  ScoreResult,
  StarRating,
  ScoringCondition,
};
