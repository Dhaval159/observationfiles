import type {
  AchievementDefinition,
  AchievementState,
  AchievementStats,
  AchievementCategory,
  AchievementRarity,
  AchievementCondition,
} from "@/types/achievement";

export interface AchievementEngineState {
  definitions: Map<string, AchievementDefinition>;
  states: Map<string, AchievementState>;
  totalXP: number;
  recentlyUnlocked: string[];
}

export interface AchievementProgressUpdate {
  achievementId: string;
  prevProgress: number;
  newProgress: number;
  currentValue: number;
  targetValue: number;
  wasUnlocked: boolean;
}

export type {
  AchievementDefinition,
  AchievementState,
  AchievementStats,
  AchievementCategory,
  AchievementRarity,
  AchievementCondition,
};
