import type { Result } from "../results/result";
import type { FullCase, CaseDefinition, CaseDifficulty } from "../../types/case";
import type { CaseProgress } from "../repositories/progress-repository";

export interface ICaseEngine {
  readonly id: string;
  readonly name: string;

  loadCase(caseId: string, playerId: string, difficulty?: CaseDifficulty): Promise<Result<FullCase>>;
  getAvailableCases(playerId: string): Promise<Result<FullCase[]>>;
  getCaseDefinition(caseId: string): Promise<Result<CaseDefinition>>;
  getAllDefinitions(): Promise<Result<CaseDefinition[]>>;
  startCase(caseId: string, playerId: string): Promise<Result<FullCase>>;
  completeCase(caseId: string, playerId: string): Promise<Result<CaseProgress>>;
  failCase(caseId: string, playerId: string, reason: string): Promise<Result<CaseProgress>>;
  resetCase(caseId: string, playerId: string): Promise<Result<FullCase>>;
  getCaseProgress(caseId: string, playerId: string): Promise<Result<CaseProgress>>;
  isCaseUnlocked(caseId: string, playerId: string): Promise<Result<boolean>>;
  getUnlockRequirements(caseId: string): Promise<Result<unknown[]>>;
  getCaseStatistics(caseId: string, playerId: string): Promise<Result<Record<string, number>>>;
}
