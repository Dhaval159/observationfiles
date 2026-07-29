export type HintLevel = 1 | 2 | 3 | 4 | 5;

export type HintCategory =
  | "observation"
  | "evidence"
  | "timeline"
  | "interrogation"
  | "deduction"
  | "theory"
  | "navigation"
  | "objective";

export interface HintDefinition {
  id: string;
  caseId: string;
  level: HintLevel;
  category: HintCategory;
  text: string;
  targetId: string | null;
  prerequisiteHintIds: string[];
  unlockConditions: HintCondition[];
  penaltyPoints: number;
  isOptional: boolean;
  cooldownMinutes: number;
}

export interface HintCondition {
  type:
    | "progress_percentage"
    | "time_elapsed"
    | "evidence_found"
    | "observations_made"
    | "npc_questioned"
    | "attempts_on_target"
    | "wrong_guesses"
    | "custom";
  threshold: number;
  targetId: string | null;
}

export interface HintState {
  hintId: string;
  isEligible: boolean;
  isRevealed: boolean;
  revealedAt: string | null;
  revealedLevel: HintLevel | null;
  viewCount: number;
}

export interface HintConfig {
  maxHintsPerCase: number;
  maxPenaltyPerHint: number;
  progressiveLevels: boolean;
  requireCooldown: boolean;
  showHintButtonAfter: number;
  freeHintsPerCase: number;
}
