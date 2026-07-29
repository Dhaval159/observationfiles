import { useState } from "react";
import { AchievementEngine } from "../services";
import type {
  AchievementDefinition,
  AchievementState,
  AchievementStats,
} from "@/types/achievement";
import type { EventEmitter } from "@/types/engine";

const noopEmitter: EventEmitter = {
  on: () => () => {},
  off: () => {},
  emit: () => {},
  once: () => {},
  listenerCount: () => 0,
};

export function useAchievementEngine(emitter: EventEmitter = noopEmitter): AchievementEngine {
  const [engine] = useState(() => new AchievementEngine(emitter));
  return engine;
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
