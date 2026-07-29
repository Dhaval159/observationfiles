import { useMemo } from "react";
import { AchievementEngine } from "../services";
import type {
  AchievementDefinition,
  AchievementState,
  AchievementStats,
  AchievementCategory,
} from "@/types/achievement";
import type { EventEmitter } from "@/types/engine";

const noopEmitter: EventEmitter = {
  on: () => () => {},
  off: () => {},
  emit: () => {},
  once: () => {},
  listenerCount: () => 0,
};

let engineInstance: AchievementEngine | null = null;

export function useAchievementEngine(emitter: EventEmitter = noopEmitter): AchievementEngine {
  return useMemo(() => {
    if (!engineInstance) {
      engineInstance = new AchievementEngine(emitter);
    }
    return engineInstance;
  }, [emitter]);
}

export function useAchievements(): AchievementDefinition[] {
  const engine = useAchievementEngine();
  return engine.getVisibleAchievements();
}

export function useAchievement(id: string): {
  definition: AchievementDefinition | null;
  state: AchievementState | null;
} {
  const engine = useAchievementEngine();
  return {
    definition: engine.getAchievement(id),
    state: engine.getProgress(id),
  };
}

export function useAchievementStats(): AchievementStats {
  const engine = useAchievementEngine();
  return engine.getStats();
}

export function useUnnotifiedUnlocks(): AchievementState[] {
  const engine = useAchievementEngine();
  return engine.getUnnotifiedUnlocks();
}

export function useAchievementProgress(): { unlocked: number; total: number; percentage: number } {
  const engine = useAchievementEngine();
  const stats = engine.getStats();
  return {
    unlocked: stats.unlockedCount,
    total: stats.totalAchievements,
    percentage: stats.completionPercentage,
  };
}
