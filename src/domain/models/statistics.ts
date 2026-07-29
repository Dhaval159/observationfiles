export interface Statistics {
  readonly playerId: string;
  readonly totalCasesStarted: number;
  readonly totalCasesCompleted: number;
  readonly totalCasesFailed: number;
  readonly completionRate: number;
  readonly totalScore: number;
  readonly averageScore: number;
  readonly highestScore: number;
  readonly totalPlayTimeSeconds: number;
  readonly totalEvidenceCollected: number;
  readonly totalObservationsMade: number;
  readonly totalHintsUsed: number;
  readonly averageHintsPerCase: number;
  readonly totalContradictionsFound: number;
  readonly totalInterrogationsCompleted: number;
  readonly totalTheoryNodesCreated: number;
  readonly totalTheoryConnectionsMade: number;
  readonly currentStreak: number;
  readonly longestStreak: number;
  readonly fastestCaseCompletionSeconds: number | null;
  readonly slowestCaseCompletionSeconds: number | null;
  readonly averageCaseCompletionSeconds: number;
  readonly perfectCasesCompleted: number;
  readonly noHintCasesCompleted: number;
  readonly byDifficulty: Record<string, CaseDifficultyStatistics>;
  readonly updatedAt: string;
}

export interface CaseDifficultyStatistics {
  readonly total: number;
  readonly completed: number;
  readonly failed: number;
  readonly averageScore: number;
  readonly bestScore: number;
  readonly averageTimeSeconds: number;
}
