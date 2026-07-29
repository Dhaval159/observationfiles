import type { HintCondition, HintDefinition, HintConfig, HintLevel } from "@/types/hint";
import type { HintEligibilityContext, HintEvaluation } from "../types";

export function evaluateHintCondition(
  condition: HintCondition,
  context: HintEligibilityContext,
): boolean {
  switch (condition.type) {
    case "progress_percentage":
      return context.progressPercentage >= condition.threshold;
    case "time_elapsed":
      return context.timeElapsed >= condition.threshold;
    case "evidence_found":
      return context.evidenceFound >= condition.threshold;
    case "observations_made":
      return context.observationsMade >= condition.threshold;
    case "npc_questioned":
      return context.npcsQuestioned >= condition.threshold;
    case "attempts_on_target":
      return context.attemptsOnTarget >= condition.threshold;
    case "wrong_guesses":
      return context.wrongGuesses >= condition.threshold;
    case "custom":
      return true;
  }
}

export function calculateHintPenalty(
  hint: HintDefinition,
  _config: HintConfig,
  hintsShown: number,
): number {
  const basePenalty = hint.penaltyPoints;
  const scalingFactor = 1 + hintsShown * 0.1;
  return Math.round(basePenalty * scalingFactor);
}

export function getNextHintLevel(
  hint: HintDefinition,
  currentLevel: HintLevel | null,
): HintLevel | null {
  if (currentLevel === null) return 1;

  const nextLevel = (currentLevel + 1) as HintLevel;
  if (nextLevel > 5) return null;
  return nextLevel;
}

export function sortHintsByLevel(hints: HintEvaluation[]): HintEvaluation[] {
  return [...hints].sort((a, b) => {
    const aLevel = a.level ?? 999;
    const bLevel = b.level ?? 999;
    if (aLevel !== bLevel) return aLevel - bLevel;
    return a.penaltyPoints - b.penaltyPoints;
  });
}

export function filterEligibleHints(hints: HintEvaluation[]): HintEvaluation[] {
  return hints.filter((h) => h.isEligible);
}

export function getDefaultHintConfig(): HintConfig {
  return {
    maxHintsPerCase: 10,
    maxPenaltyPerHint: 50,
    progressiveLevels: true,
    requireCooldown: true,
    showHintButtonAfter: 20,
    freeHintsPerCase: 3,
  };
}
