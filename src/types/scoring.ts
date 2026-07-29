export type StarRating = 1 | 2 | 3 | 4 | 5;

export interface ScoreBreakdown {
  observationScore: number;
  evidenceScore: number;
  logicScore: number;
  timelineAccuracy: number;
  contradictionsFound: number;
  interrogationScore: number;
  theoryBoardAccuracy: number;
  hintsPenalty: number;
  wrongAccusationsPenalty: number;
  timeBonus: number;
  optionalBonus: number;
  hiddenDiscoveryBonus: number;
}

export interface ScoringRule {
  id: string;
  category: keyof ScoreBreakdown;
  description: string;
  maxPoints: number;
  multiplier: number;
  condition: ScoringCondition | null;
}

export interface ScoringCondition {
  type: "difficulty" | "case_specific" | "player_level" | "custom";
  config: Record<string, unknown>;
}

export interface ScoringConfig {
  rules: ScoringRule[];
  starThresholds: Record<StarRating, number>;
  maxPossibleScore: number;
  minPassingScore: number;
  hintPenaltyPerHint: number;
  hintPenaltyMultiplier: number;
  wrongAccusationPenalty: number;
  timeBonusMax: number;
  timeBonusDecayRate: number;
  hiddenDiscoveryBonus: number;
  optionalObjectiveBonus: number;
  contradictionsBonus: number;
  timelineAccuracyWeight: number;
  evidenceCompletenessWeight: number;
  observationThoroughnessWeight: number;
  interrogationEffectivenessWeight: number;
  theoryBoardCorrectnessWeight: number;
}

export interface ScoreResult {
  userId: string;
  caseId: string;
  totalScore: number;
  breakdown: ScoreBreakdown;
  starRating: StarRating;
  isPassing: boolean;
  rank: "S" | "A" | "B" | "C" | "D" | "F";
  hintsUsed: number;
  wrongAccusations: number;
  completionTimeMinutes: number;
  completedAt: string;
  isNewHighScore: boolean;
  percentile: number | null;
}
