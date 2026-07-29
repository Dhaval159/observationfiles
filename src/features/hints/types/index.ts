import type { HintDefinition, HintState, HintLevel, HintCategory, HintConfig } from "@/types/hint";

export interface HintEngineState {
  hints: Map<string, HintDefinition>;
  hintStates: Map<string, HintState>;
  hintsShownThisCase: number;
  freeHintsRemaining: number;
  totalPenalty: number;
  config: HintConfig;
  lastHintRequestedAt: string | null;
}

export interface HintRequest {
  caseId: string;
  category?: HintCategory;
  targetId?: string;
  context: HintEligibilityContext;
}

export interface HintEligibilityContext {
  progressPercentage: number;
  timeElapsed: number;
  evidenceFound: number;
  totalEvidence: number;
  observationsMade: number;
  totalObservations: number;
  npcsQuestioned: number;
  totalNPCs: number;
  attemptsOnTarget: number;
  wrongGuesses: number;
}

export interface HintEvaluation {
  hint: HintDefinition;
  isEligible: boolean;
  level: HintLevel | null;
  penaltyPoints: number;
  cooldownRemaining: number;
}

export type { HintDefinition, HintState, HintLevel, HintCategory, HintConfig };
