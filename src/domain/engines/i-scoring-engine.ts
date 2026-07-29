import type { Result } from "../results/result";

export interface ScoreBreakdown {
  readonly baseScore: number;
  readonly evidenceScore: number;
  readonly observationScore: number;
  readonly interrogationScore: number;
  readonly timelineScore: number;
  readonly theoryScore: number;
  readonly speedBonus: number;
  readonly accuracyBonus: number;
  readonly hintPenalty: number;
  readonly totalScore: number;
  readonly maxPossibleScore: number;
  readonly percentage: number;
  readonly rating: 1 | 2 | 3 | 4 | 5;
}

export interface IScoringEngine {
  readonly id: string;
  readonly name: string;

  calculateScore(caseId: string, playerId: string): Promise<Result<ScoreBreakdown>>;
  getScoreBreakdown(caseId: string, playerId: string): Promise<Result<ScoreBreakdown>>;
  addPoints(caseId: string, playerId: string, category: string, points: number): Promise<Result<number>>;
  applyHintPenalty(caseId: string, playerId: string): Promise<Result<number>>;
  calculateSpeedBonus(caseId: string, playerId: string, completionTimeSeconds: number): Promise<Result<number>>;
  getRating(caseId: string, playerId: string): Promise<Result<1 | 2 | 3 | 4 | 5>>;
  getCategoryScore(caseId: string, playerId: string, category: string): Promise<Result<number>>;
  getMaxPossibleScore(caseId: string): Promise<Result<number>>;
  getScorePercentile(caseId: string, playerId: string): Promise<Result<number>>;
}
