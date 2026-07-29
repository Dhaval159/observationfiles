import type { BaseRepository } from "./base-repository";
import type { Result } from "../results/result";

export interface PlayerProgress {
  id: string;
  playerId: string;
  totalScore: number;
  casesCompleted: number;
  totalCases: number;
  evidenceCollected: number;
  observationsMade: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  playTimeSeconds: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CaseProgress {
  id: string;
  playerId: string;
  caseId: string;
  status: string;
  score: number;
  maxScore: number;
  timeSpentSeconds: number;
  evidenceFound: number;
  totalEvidence: number;
  observationsMade: number;
  totalObservations: number;
  hintsUsed: number;
  contradictionsFound: number;
  startedAt: string | null;
  completedAt: string | null;
  lastSavedAt: string | null;
}

export interface ProgressRepository extends BaseRepository<PlayerProgress> {
  findByPlayer(playerId: string): Promise<Result<PlayerProgress>>;
  getCaseProgress(playerId: string, caseId: string): Promise<Result<CaseProgress>>;
  getAllCaseProgress(playerId: string): Promise<Result<CaseProgress[]>>;
  updateCaseProgress(playerId: string, caseId: string, updates: Partial<CaseProgress>): Promise<Result<CaseProgress>>;
  incrementScore(playerId: string, caseId: string, points: number): Promise<Result<CaseProgress>>;
  incrementHintsUsed(playerId: string, caseId: string): Promise<Result<CaseProgress>>;
  incrementEvidenceFound(playerId: string, caseId: string): Promise<Result<CaseProgress>>;
  incrementObservationsMade(playerId: string, caseId: string): Promise<Result<CaseProgress>>;
  recordPlayTime(playerId: string, seconds: number): Promise<Result<PlayerProgress>>;
  getPlayTime(playerId: string): Promise<Result<number>>;
}
