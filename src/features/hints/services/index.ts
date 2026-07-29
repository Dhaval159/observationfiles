import type { EventEmitter } from "@/types/engine";
import type { HintDefinition, HintState, HintLevel, HintCategory, HintConfig } from "@/types/hint";
import type {
  HintEngineState,
  HintRequest,
  HintEligibilityContext,
  HintEvaluation,
} from "../types";
import {
  evaluateHintCondition,
  calculateHintPenalty,
  getNextHintLevel,
  sortHintsByLevel,
  filterEligibleHints,
  getDefaultHintConfig,
} from "../utils";

export class HintEngine {
  readonly id: string;

  private state: HintEngineState;
  private emitter: EventEmitter;

  constructor(emitter: EventEmitter, config?: HintConfig) {
    this.id = `hint-engine-${Math.random().toString(36).slice(2, 9)}`;
    this.emitter = emitter;
    this.state = {
      hints: new Map(),
      hintStates: new Map(),
      hintsShownThisCase: 0,
      freeHintsRemaining: config?.freeHintsPerCase ?? getDefaultHintConfig().freeHintsPerCase,
      totalPenalty: 0,
      config: config ?? getDefaultHintConfig(),
      lastHintRequestedAt: null,
    };
  }

  loadHints(hints: HintDefinition[], config?: Partial<HintConfig>): void {
    for (const hint of hints) {
      this.state.hints.set(hint.id, hint);
      this.state.hintStates.set(hint.id, {
        hintId: hint.id,
        isEligible: false,
        isRevealed: false,
        revealedAt: null,
        revealedLevel: null,
        viewCount: 0,
      });
    }

    if (config) {
      this.state.config = { ...this.state.config, ...config };
    }
  }

  getHint(hintId: string): HintDefinition | null {
    return this.state.hints.get(hintId) ?? null;
  }

  getHintsByCategory(category: HintCategory): HintDefinition[] {
    const result: HintDefinition[] = [];
    for (const hint of this.state.hints.values()) {
      if (hint.category === category) {
        result.push(hint);
      }
    }
    return result;
  }

  getHintsForTarget(targetId: string): HintDefinition[] {
    const result: HintDefinition[] = [];
    for (const hint of this.state.hints.values()) {
      if (hint.targetId === targetId) {
        result.push(hint);
      }
    }
    return result;
  }

  evaluateHint(hintId: string, context: HintEligibilityContext): HintEvaluation {
    const hint = this.state.hints.get(hintId);
    if (!hint) {
      throw new Error(`Hint not found: ${hintId}`);
    }

    const hintState = this.state.hintStates.get(hintId);
    if (!hintState) {
      throw new Error(`Hint state not found: ${hintId}`);
    }

    if (hintState.isRevealed) {
      return {
        hint,
        isEligible: false,
        level: null,
        penaltyPoints: 0,
        cooldownRemaining: 0,
      };
    }

    let cooldownRemaining = 0;
    if (this.state.config.requireCooldown && hintState.revealedAt) {
      const lastRevealed = new Date(hintState.revealedAt).getTime();
      const now = Date.now();
      const cooldownMs = hint.cooldownMinutes * 60 * 1000;
      const elapsed = now - lastRevealed;
      if (elapsed < cooldownMs) {
        cooldownRemaining = Math.ceil((cooldownMs - elapsed) / 60000);
      }
    }

    for (const prerequisiteId of hint.prerequisiteHintIds) {
      const prereqState = this.state.hintStates.get(prerequisiteId);
      if (!prereqState || !prereqState.isRevealed) {
        return {
          hint,
          isEligible: false,
          level: null,
          penaltyPoints: 0,
          cooldownRemaining,
        };
      }
    }

    const allConditionsMet = hint.unlockConditions.every((condition) =>
      evaluateHintCondition(condition, context),
    );

    if (!allConditionsMet) {
      return {
        hint,
        isEligible: false,
        level: null,
        penaltyPoints: 0,
        cooldownRemaining,
      };
    }

    const revealedLevel = hintState.revealedLevel;
    const nextLevel = this.state.config.progressiveLevels
      ? (getNextHintLevel(hint, revealedLevel) ?? hint.level)
      : hint.level;

    const penaltyPoints = calculateHintPenalty(
      hint,
      this.state.config,
      this.state.hintsShownThisCase,
    );

    return {
      hint,
      isEligible: true,
      level: nextLevel,
      penaltyPoints,
      cooldownRemaining,
    };
  }

  requestHint(request: HintRequest): HintEvaluation | null {
    if (!this.canRequestHint()) {
      return null;
    }

    let candidates: HintDefinition[] = [];

    if (request.targetId) {
      candidates = this.getHintsForTarget(request.targetId);
    } else if (request.category) {
      candidates = this.getHintsByCategory(request.category);
    } else {
      candidates = Array.from(this.state.hints.values());
    }

    if (candidates.length === 0) {
      return null;
    }

    const evaluations: HintEvaluation[] = [];
    for (const hint of candidates) {
      evaluations.push(this.evaluateHint(hint.id, request.context));
    }

    const eligible = filterEligibleHints(evaluations);
    if (eligible.length === 0) {
      return null;
    }

    const sorted = sortHintsByLevel(eligible);
    const best = sorted[0];

    this.state.lastHintRequestedAt = new Date().toISOString();

    return best ?? null;
  }

  revealHint(hintId: string, level: HintLevel): HintState {
    const hint = this.state.hints.get(hintId);
    if (!hint) {
      throw new Error(`Hint not found: ${hintId}`);
    }

    const hintState = this.state.hintStates.get(hintId);
    if (!hintState) {
      throw new Error(`Hint state not found: ${hintId}`);
    }

    const now = new Date().toISOString();
    hintState.isRevealed = true;
    hintState.revealedAt = now;
    hintState.revealedLevel = level;
    hintState.viewCount += 1;

    this.state.hintsShownThisCase += 1;

    const penalty = hint.penaltyPoints;
    this.state.totalPenalty += penalty;

    if (this.state.freeHintsRemaining > 0 && hintState.viewCount <= 1) {
      this.state.freeHintsRemaining -= 1;
    }

    this.emitter.emit("hint_revealed", {
      hintId,
      level,
      penalty,
      timestamp: now,
    });

    return { ...hintState };
  }

  getAvailableHints(context: HintEligibilityContext): HintEvaluation[] {
    const evaluations: HintEvaluation[] = [];
    for (const [hintId] of this.state.hints) {
      const hintState = this.state.hintStates.get(hintId);
      if (!hintState?.isRevealed) {
        evaluations.push(this.evaluateHint(hintId, context));
      }
    }
    return filterEligibleHints(evaluations);
  }

  getRevealedHints(): HintState[] {
    const result: HintState[] = [];
    for (const state of this.state.hintStates.values()) {
      if (state.isRevealed) {
        result.push({ ...state });
      }
    }
    return result;
  }

  getHintPenalty(): number {
    return this.state.totalPenalty;
  }

  getFreeHintsRemaining(): number {
    return this.state.freeHintsRemaining;
  }

  getHintsRemaining(): number {
    return this.state.config.maxHintsPerCase - this.state.hintsShownThisCase;
  }

  canRequestHint(): boolean {
    return this.getHintsRemaining() > 0;
  }

  resetCase(): void {
    this.state.hintsShownThisCase = 0;
    this.state.freeHintsRemaining = this.state.config.freeHintsPerCase;
    this.state.totalPenalty = 0;
    this.state.lastHintRequestedAt = null;

    for (const state of this.state.hintStates.values()) {
      state.isEligible = false;
      state.isRevealed = false;
      state.revealedAt = null;
      state.revealedLevel = null;
      state.viewCount = 0;
    }
  }

  serialize(): string {
    const hints = Array.from(this.state.hints.entries());
    const hintStates = Array.from(this.state.hintStates.entries());

    return JSON.stringify({
      hints: hints.map(([id, def]) => [id, def]),
      hintStates: hintStates.map(([id, state]) => [id, state]),
      hintsShownThisCase: this.state.hintsShownThisCase,
      freeHintsRemaining: this.state.freeHintsRemaining,
      totalPenalty: this.state.totalPenalty,
      config: this.state.config,
      lastHintRequestedAt: this.state.lastHintRequestedAt,
    });
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);

    this.state.hints = new Map(parsed.hints);
    this.state.hintStates = new Map(parsed.hintStates);
    this.state.hintsShownThisCase = parsed.hintsShownThisCase;
    this.state.freeHintsRemaining = parsed.freeHintsRemaining;
    this.state.totalPenalty = parsed.totalPenalty;
    this.state.config = parsed.config;
    this.state.lastHintRequestedAt = parsed.lastHintRequestedAt;
  }

  reset(): void {
    this.state.hints = new Map();
    this.state.hintStates = new Map();
    this.state.hintsShownThisCase = 0;
    this.state.freeHintsRemaining = this.state.config.freeHintsPerCase;
    this.state.totalPenalty = 0;
    this.state.lastHintRequestedAt = null;
  }
}
