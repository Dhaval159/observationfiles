import type { QueryOptions, PaginatedResult } from "./base-repository";
import type { Result } from "../results/result";
import type { AchievementDefinition, AchievementState, AchievementStats } from "../../types/achievement";

export interface AchievementRepository {
  getDefinition(achievementId: string): Promise<Result<AchievementDefinition>>;
  getAllDefinitions(): Promise<Result<AchievementDefinition[]>>;
  getDefinitionsByCategory(category: string): Promise<Result<AchievementDefinition[]>>;
  getPlayerAchievements(playerId: string): Promise<Result<AchievementState[]>>;
  getPlayerAchievementState(playerId: string, achievementId: string): Promise<Result<AchievementState>>;
  updateProgress(playerId: string, achievementId: string, progress: number, currentValue: number): Promise<Result<AchievementState>>;
  unlockAchievement(playerId: string, achievementId: string): Promise<Result<AchievementState>>;
  getStats(playerId: string): Promise<Result<AchievementStats>>;
  getRecentlyUnlocked(playerId: string, limit?: number): Promise<Result<AchievementState[]>>;
  findPaginated(playerId: string, options: QueryOptions): Promise<Result<PaginatedResult<AchievementState>>>;
}
