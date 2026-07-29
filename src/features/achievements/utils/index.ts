import type {
  AchievementCondition,
  AchievementDefinition,
  AchievementState,
  AchievementCategory,
  AchievementRarity,
} from "@/types/achievement";

export function evaluateAchievementCondition(
  condition: AchievementCondition,
  value: number,
  targetId?: string,
): boolean {
  if (targetId !== undefined && condition.targetId !== null && condition.targetId !== targetId) {
    return false;
  }
  return value >= condition.threshold;
}

export function calculateAchievementProgress(
  condition: AchievementCondition,
  currentValue: number,
): { progress: number; currentValue: number; targetValue: number } {
  const targetValue = condition.threshold;
  const progress = targetValue > 0 ? Math.min(1, currentValue / targetValue) : 0;
  return { progress, currentValue, targetValue };
}

export function sortAchievements(
  definitions: AchievementDefinition[],
  sortBy: "category" | "rarity" | "progress" | "recently_unlocked",
): AchievementDefinition[] {
  const sorted = [...definitions];

  switch (sortBy) {
    case "category":
      sorted.sort((a, b) => a.category.localeCompare(b.category) || a.sortOrder - b.sortOrder);
      break;
    case "rarity": {
      const rarityOrder: Record<AchievementRarity, number> = {
        common: 0,
        uncommon: 1,
        rare: 2,
        epic: 3,
        legendary: 4,
      };
      sorted.sort(
        (a, b) =>
          (rarityOrder[b.rarity] ?? 0) - (rarityOrder[a.rarity] ?? 0) || a.sortOrder - b.sortOrder,
      );
      break;
    }
    case "progress":
    case "recently_unlocked":
      sorted.sort((a, b) => a.sortOrder - b.sortOrder);
      break;
  }

  return sorted;
}

export function filterAchievements(
  definitions: AchievementDefinition[],
  filters: {
    category?: AchievementCategory;
    rarity?: AchievementRarity;
    unlocked?: boolean;
    hidden?: boolean;
  },
): AchievementDefinition[] {
  return definitions.filter((d) => {
    if (filters.category !== undefined && d.category !== filters.category) return false;
    if (filters.rarity !== undefined && d.rarity !== filters.rarity) return false;
    if (filters.hidden !== undefined && d.isHidden !== filters.hidden) return false;
    return true;
  });
}

export function getAchievementProgressPercentage(state: AchievementState): number {
  if (state.targetValue <= 0) return state.isUnlocked ? 100 : 0;
  return Math.min(100, Math.round((state.currentValue / state.targetValue) * 100));
}
