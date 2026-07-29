export type AchievementCategory =
  | "case_completion"
  | "evidence"
  | "observation"
  | "interrogation"
  | "timeline"
  | "theory"
  | "speed"
  | "perfection"
  | "exploration"
  | "challenge"
  | "social"
  | "hidden"
  | "mastery";

export type AchievementRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface AchievementDefinition {
  id: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  title: string;
  description: string;
  detailedDescription: string;
  icon: string;
  isHidden: boolean;
  unlockConditions: AchievementCondition[];
  xpReward: number;
  cosmeticReward: string | null;
  sortOrder: number;
}

export interface AchievementCondition {
  type:
    | "cases_completed"
    | "cases_completed_difficulty"
    | "cases_completed_perfect"
    | "evidence_found_total"
    | "evidence_type_collected"
    | "observations_made"
    | "contradictions_found"
    | "interrogations_completed"
    | "speed_run"
    | "no_hints"
    | "all_optional"
    | "all_hidden"
    | "perfect_timeline"
    | "perfect_theory_board"
    | "streak"
    | "total_score"
    | "specific_case"
    | "custom";
  threshold: number;
  targetId: string | null;
  params: Record<string, unknown>;
}

export interface AchievementState {
  achievementId: string;
  progress: number;
  currentValue: number;
  targetValue: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
  notifiedAt: string | null;
}

export interface AchievementStats {
  totalAchievements: number;
  unlockedCount: number;
  completionPercentage: number;
  byCategory: Record<AchievementCategory, { total: number; unlocked: number }>;
  byRarity: Record<AchievementRarity, { total: number; unlocked: number }>;
  rarestUnlocked: AchievementDefinition | null;
  recentlyUnlocked: { achievementId: string; unlockedAt: string }[];
  totalXP: number;
}
