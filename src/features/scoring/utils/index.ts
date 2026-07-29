import type { ScoreBreakdown, ScoringConfig, StarRating, ScoringRule } from "@/types/scoring";

export function calculateStarRating(
  score: number,
  thresholds: Record<StarRating, number>,
): StarRating {
  if (score >= (thresholds[5] ?? Infinity)) return 5;
  if (score >= (thresholds[4] ?? Infinity)) return 4;
  if (score >= (thresholds[3] ?? Infinity)) return 3;
  if (score >= (thresholds[2] ?? Infinity)) return 2;
  return 1;
}

export function calculateRank(starRating: StarRating): "S" | "A" | "B" | "C" | "D" | "F" {
  switch (starRating) {
    case 5:
      return "S";
    case 4:
      return "A";
    case 3:
      return "B";
    case 2:
      return "C";
    case 1:
      return "D";
    default:
      return "F";
  }
}

export function calculateTimeBonus(
  maxBonus: number,
  decayRate: number,
  elapsedMinutes: number,
): number {
  if (elapsedMinutes <= 0) return maxBonus;
  return Math.max(0, Math.round(maxBonus * Math.exp(-decayRate * elapsedMinutes)));
}

export function calculatePenaltyMultiplier(hintsUsed: number): number {
  if (hintsUsed <= 0) return 1.0;
  return 1.0 + 0.1 * hintsUsed;
}

export function createDefaultScoringConfig(difficulty?: string): ScoringConfig {
  const baseRules: ScoringRule[] = [
    {
      id: "observations",
      category: "observationScore",
      description: "Observations made",
      maxPoints: 100,
      multiplier: 1.0,
      condition: null,
    },
    {
      id: "evidence",
      category: "evidenceScore",
      description: "Evidence collected and analyzed",
      maxPoints: 150,
      multiplier: 1.0,
      condition: null,
    },
    {
      id: "logic",
      category: "logicScore",
      description: "Logical deductions",
      maxPoints: 100,
      multiplier: 1.0,
      condition: null,
    },
    {
      id: "timeline",
      category: "timelineAccuracy",
      description: "Timeline accuracy",
      maxPoints: 80,
      multiplier: 1.0,
      condition: null,
    },
    {
      id: "contradictions",
      category: "contradictionsFound",
      description: "Contradictions found",
      maxPoints: 120,
      multiplier: 1.0,
      condition: null,
    },
    {
      id: "interrogation",
      category: "interrogationScore",
      description: "Interrogation effectiveness",
      maxPoints: 100,
      multiplier: 1.0,
      condition: null,
    },
    {
      id: "theory_board",
      category: "theoryBoardAccuracy",
      description: "Theory board correctness",
      maxPoints: 150,
      multiplier: 1.0,
      condition: null,
    },
  ];

  const difficultyMultiplier = difficulty === "easy" ? 0.8 : difficulty === "hard" ? 1.2 : 1.0;

  const adjustedRules = baseRules.map((rule) => ({
    ...rule,
    maxPoints: Math.round(rule.maxPoints * difficultyMultiplier),
  }));

  return {
    rules: adjustedRules,
    starThresholds: {
      1: 0,
      2: Math.round(250 * difficultyMultiplier),
      3: Math.round(400 * difficultyMultiplier),
      4: Math.round(550 * difficultyMultiplier),
      5: Math.round(650 * difficultyMultiplier),
    },
    maxPossibleScore: Math.round(800 * difficultyMultiplier),
    minPassingScore: Math.round(250 * difficultyMultiplier),
    hintPenaltyPerHint: 5,
    hintPenaltyMultiplier: 1.5,
    wrongAccusationPenalty: 25,
    timeBonusMax: 50,
    timeBonusDecayRate: 0.02,
    hiddenDiscoveryBonus: 30,
    optionalObjectiveBonus: 20,
    contradictionsBonus: 10,
    timelineAccuracyWeight: 1.0,
    evidenceCompletenessWeight: 1.0,
    observationThoroughnessWeight: 1.0,
    interrogationEffectivenessWeight: 1.0,
    theoryBoardCorrectnessWeight: 1.0,
  };
}

export function validateScoreBreakdown(breakdown: ScoreBreakdown, config: ScoringConfig): boolean {
  if (breakdown.observationScore < 0 || breakdown.observationScore > config.maxPossibleScore)
    return false;
  if (breakdown.evidenceScore < 0 || breakdown.evidenceScore > config.maxPossibleScore)
    return false;
  if (breakdown.logicScore < 0 || breakdown.logicScore > config.maxPossibleScore) return false;
  if (breakdown.timelineAccuracy < 0 || breakdown.timelineAccuracy > config.maxPossibleScore)
    return false;
  if (breakdown.contradictionsFound < 0 || breakdown.contradictionsFound > config.maxPossibleScore)
    return false;
  if (breakdown.interrogationScore < 0 || breakdown.interrogationScore > config.maxPossibleScore)
    return false;
  if (breakdown.theoryBoardAccuracy < 0 || breakdown.theoryBoardAccuracy > config.maxPossibleScore)
    return false;
  return true;
}

export function formatScoreBreakdown(breakdown: ScoreBreakdown): string {
  const lines: string[] = [];
  const items: [string, number][] = [
    ["Observations", breakdown.observationScore],
    ["Evidence", breakdown.evidenceScore],
    ["Logic", breakdown.logicScore],
    ["Timeline", breakdown.timelineAccuracy],
    ["Contradictions", breakdown.contradictionsFound],
    ["Interrogation", breakdown.interrogationScore],
    ["Theory Board", breakdown.theoryBoardAccuracy],
    ["Hints Penalty", -breakdown.hintsPenalty],
    ["Wrong Accusations", -breakdown.wrongAccusationsPenalty],
    ["Time Bonus", breakdown.timeBonus],
    ["Optional Bonus", breakdown.optionalBonus],
    ["Hidden Discovery", breakdown.hiddenDiscoveryBonus],
  ];

  for (const [label, value] of items) {
    const prefix = value >= 0 ? "+" : "";
    lines.push(`${label}: ${prefix}${value}`);
  }

  return lines.join("\n");
}
