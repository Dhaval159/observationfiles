import type { Result } from "../results/result";
import type { HintLevel } from "../enums";

export interface HintDefinition {
  readonly id: string;
  readonly caseId: string;
  readonly objectiveId: string | null;
  readonly taskId: string | null;
  readonly level: HintLevel;
  readonly category: string;
  readonly title: string;
  readonly content: string;
  readonly unlockCondition: Record<string, unknown>;
  readonly costScore: number;
  readonly isSequential: boolean;
  readonly prerequisiteHintId: string | null;
  readonly order: number;
}

export interface HintState {
  readonly hintId: string;
  readonly isUnlocked: boolean;
  readonly isUsed: boolean;
  readonly usedAt: string | null;
  readonly wasHelpful: boolean | null;
}

export interface IHintEngine {
  readonly id: string;
  readonly name: string;

  getAvailableHints(caseId: string, playerId: string): Promise<Result<HintDefinition[]>>;
  getHint(hintId: string): Promise<Result<HintDefinition>>;
  getHintState(hintId: string, playerId: string): Promise<Result<HintState>>;
  useHint(caseId: string, hintId: string, playerId: string): Promise<Result<HintDefinition>>;
  canUseHint(caseId: string, hintId: string, playerId: string): Promise<Result<boolean>>;
  getHintHistory(caseId: string, playerId: string): Promise<Result<HintState[]>>;
  getHintsUsed(caseId: string, playerId: string): Promise<Result<number>>;
  getHintCost(caseId: string, hintId: string): Promise<Result<number>>;
  markHintHelpful(hintId: string, playerId: string, wasHelpful: boolean): Promise<Result<void>>;
  getNextSequentialHint(caseId: string, hintId: string, playerId: string): Promise<Result<HintDefinition | null>>;
}
