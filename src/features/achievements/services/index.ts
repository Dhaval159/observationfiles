import type { EventEmitter } from "@/types/engine";
import type {
  AchievementDefinition,
  AchievementState,
  AchievementStats,
  AchievementCategory,
  AchievementRarity,
} from "@/types/achievement";
import type { AchievementEngineState, AchievementProgressUpdate } from "../types";
import { evaluateAchievementCondition, calculateAchievementProgress } from "../utils";

export class AchievementEngine {
  private emitter: EventEmitter;
  private state: AchievementEngineState;

  constructor(emitter: EventEmitter) {
    this.emitter = emitter;
    this.state = {
      definitions: new Map(),
      states: new Map(),
      totalXP: 0,
      recentlyUnlocked: [],
    };
  }

  getState(): AchievementEngineState {
    return this.state;
  }

  loadDefinitions(definitions: AchievementDefinition[]): void {
    this.state.definitions.clear();
    this.state.states.clear();

    for (const def of definitions) {
      this.state.definitions.set(def.id, def);

      const existingState = this.state.states.get(def.id);
      if (existingState) {
        continue;
      }

      const primaryCondition = def.unlockConditions[0];
      const targetValue = primaryCondition?.threshold ?? 1;

      this.state.states.set(def.id, {
        achievementId: def.id,
        progress: 0,
        currentValue: 0,
        targetValue,
        isUnlocked: false,
        unlockedAt: null,
        notifiedAt: null,
      });
    }
  }

  getAchievement(id: string): AchievementDefinition | null {
    return this.state.definitions.get(id) ?? null;
  }

  getAllAchievements(): AchievementDefinition[] {
    return Array.from(this.state.definitions.values());
  }

  getUnlockedAchievements(): AchievementDefinition[] {
    const unlocked: AchievementDefinition[] = [];
    for (const [id, def] of this.state.definitions) {
      const state = this.state.states.get(id);
      if (state?.isUnlocked) {
        unlocked.push(def);
      }
    }
    return unlocked;
  }

  getLockedAchievements(includeHidden = false): AchievementDefinition[] {
    const locked: AchievementDefinition[] = [];
    for (const [id, def] of this.state.definitions) {
      const state = this.state.states.get(id);
      if (!state?.isUnlocked && (includeHidden || !def.isHidden)) {
        locked.push(def);
      }
    }
    return locked;
  }

  getVisibleAchievements(): AchievementDefinition[] {
    const visible: AchievementDefinition[] = [];
    for (const [id, def] of this.state.definitions) {
      const state = this.state.states.get(id);
      if (!def.isHidden || state?.isUnlocked) {
        visible.push(def);
      }
    }
    return visible;
  }

  updateProgress(type: string, value: number, targetId?: string): AchievementProgressUpdate[] {
    const updates: AchievementProgressUpdate[] = [];

    for (const [id, def] of this.state.definitions) {
      const state = this.state.states.get(id);
      if (!state) continue;
      if (state.isUnlocked) continue;

      const matchingCondition = def.unlockConditions.find((c) => c.type === type);
      if (!matchingCondition) continue;

      if (!evaluateAchievementCondition(matchingCondition, value, targetId)) {
        const isAccumulating = [
          "cases_completed",
          "evidence_found_total",
          "observations_made",
          "contradictions_found",
          "interrogations_completed",
          "total_score",
          "streak",
          "evidence_type_collected",
        ].includes(matchingCondition.type);

        if (isAccumulating) {
          const { progress, currentValue, targetValue } = calculateAchievementProgress(
            matchingCondition,
            value,
          );
          const prevProgress = state.progress;
          state.currentValue = currentValue;
          state.progress = progress;

          updates.push({
            achievementId: id,
            prevProgress,
            newProgress: progress,
            currentValue,
            targetValue,
            wasUnlocked: false,
          });
        }
        continue;
      }

      const prevProgress = state.progress;
      const { progress, currentValue, targetValue } = calculateAchievementProgress(
        matchingCondition,
        value,
      );

      state.currentValue = currentValue;
      state.progress = progress;

      const wasUnlocked = !state.isUnlocked && progress >= 1;
      if (wasUnlocked) {
        this.unlockAchievement(id);
      }

      updates.push({
        achievementId: id,
        prevProgress,
        newProgress: progress,
        currentValue,
        targetValue,
        wasUnlocked,
      });
    }

    return updates;
  }

  checkAchievement(achievementId: string): boolean {
    const state = this.state.states.get(achievementId);
    return state?.isUnlocked ?? false;
  }

  unlockAchievement(achievementId: string): AchievementState {
    const state = this.state.states.get(achievementId);
    const def = this.state.definitions.get(achievementId);

    if (!state || !def) {
      throw new Error(`Achievement "${achievementId}" not found`);
    }

    if (state.isUnlocked) {
      return state;
    }

    state.isUnlocked = true;
    state.unlockedAt = new Date().toISOString();
    state.progress = 1;

    this.state.totalXP += def.xpReward;
    this.state.recentlyUnlocked.push(achievementId);

    if (this.state.recentlyUnlocked.length > 50) {
      this.state.recentlyUnlocked.shift();
    }

    this.emitter.emit("achievement_unlocked", {
      achievementId,
      definition: def,
      state,
      totalXP: this.state.totalXP,
    });

    return state;
  }

  getStats(): AchievementStats {
    const totalAchievements = this.state.definitions.size;
    const unlockedCount = this.getUnlockedAchievements().length;
    const completionPercentage =
      totalAchievements > 0 ? Math.round((unlockedCount / totalAchievements) * 100) : 0;

    const byCategory: Record<string, { total: number; unlocked: number }> = {};
    const byRarity: Record<string, { total: number; unlocked: number }> = {};

    for (const [, def] of this.state.definitions) {
      const state = this.state.states.get(def.id);

      if (!byCategory[def.category]) {
        byCategory[def.category] = { total: 0, unlocked: 0 };
      }
      byCategory[def.category]!.total++;

      if (state?.isUnlocked) {
        byCategory[def.category]!.unlocked++;
      }

      if (!byRarity[def.rarity]) {
        byRarity[def.rarity] = { total: 0, unlocked: 0 };
      }
      byRarity[def.rarity]!.total++;

      if (state?.isUnlocked) {
        byRarity[def.rarity]!.unlocked++;
      }
    }

    const rarityOrder: AchievementRarity[] = ["legendary", "epic", "rare", "uncommon", "common"];
    let rarestUnlocked: AchievementDefinition | null = null;

    for (const rarity of rarityOrder) {
      for (const [, def] of this.state.definitions) {
        const state = this.state.states.get(def.id);
        if (def.rarity === rarity && state?.isUnlocked) {
          rarestUnlocked = def;
          break;
        }
      }
      if (rarestUnlocked) break;
    }

    const recentlyUnlocked = Array.from(this.state.recentlyUnlocked)
      .reverse()
      .map((id) => ({
        achievementId: id,
        unlockedAt: this.state.states.get(id)?.unlockedAt ?? "",
      }));

    return {
      totalAchievements,
      unlockedCount,
      completionPercentage,
      byCategory: byCategory as AchievementStats["byCategory"],
      byRarity: byRarity as AchievementStats["byRarity"],
      rarestUnlocked,
      recentlyUnlocked,
      totalXP: this.state.totalXP,
    };
  }

  getProgress(achievementId: string): AchievementState | null {
    return this.state.states.get(achievementId) ?? null;
  }

  getCategoryProgress(category: AchievementCategory): {
    unlocked: number;
    total: number;
    percentage: number;
  } {
    let total = 0;
    let unlocked = 0;

    for (const [, def] of this.state.definitions) {
      if (def.category !== category) continue;
      total++;
      const state = this.state.states.get(def.id);
      if (state?.isUnlocked) unlocked++;
    }

    const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;
    return { unlocked, total, percentage };
  }

  clearNotification(achievementId: string): void {
    const state = this.state.states.get(achievementId);
    if (state) {
      state.notifiedAt = new Date().toISOString();
    }
  }

  getUnnotifiedUnlocks(): AchievementState[] {
    const unnotified: AchievementState[] = [];
    for (const [, state] of this.state.states) {
      if (state.isUnlocked && !state.notifiedAt) {
        unnotified.push(state);
      }
    }
    return unnotified;
  }

  getRecentlyUnlocked(): AchievementDefinition[] {
    const result: AchievementDefinition[] = [];
    for (const id of this.state.recentlyUnlocked) {
      const def = this.state.definitions.get(id);
      if (def) result.push(def);
    }
    return result.reverse();
  }

  reset(): void {
    this.state = {
      definitions: this.state.definitions,
      states: new Map(),
      totalXP: 0,
      recentlyUnlocked: [],
    };

    for (const [id, def] of this.state.definitions) {
      const primaryCondition = def.unlockConditions[0];
      const targetValue = primaryCondition?.threshold ?? 1;

      this.state.states.set(id, {
        achievementId: id,
        progress: 0,
        currentValue: 0,
        targetValue,
        isUnlocked: false,
        unlockedAt: null,
        notifiedAt: null,
      });
    }
  }

  serialize(): string {
    const states = Array.from(this.state.states.entries()).map(([id, state]) => [id, state]);
    return JSON.stringify({
      totalXP: this.state.totalXP,
      recentlyUnlocked: this.state.recentlyUnlocked,
      states,
    });
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.state.totalXP = parsed.totalXP ?? 0;
    this.state.recentlyUnlocked = parsed.recentlyUnlocked ?? [];

    if (parsed.states) {
      for (const [id, state] of parsed.states) {
        this.state.states.set(id, state as AchievementState);
      }
    }
  }
}
