import type { Result } from "../results/result";
import type { InvestigationState } from "../enums";

export interface IInvestigationEngine {
  readonly id: string;
  readonly name: string;

  getState(caseId: string, playerId: string): Promise<Result<InvestigationState>>;
  setState(caseId: string, playerId: string, state: InvestigationState): Promise<Result<InvestigationState>>;
  pause(caseId: string, playerId: string): Promise<Result<void>>;
  resume(caseId: string, playerId: string): Promise<Result<void>>;
  getElapsedTime(caseId: string, playerId: string): Promise<Result<number>>;
  getPhases(): ReadonlyArray<string>;
  getCurrentPhase(caseId: string, playerId: string): Promise<Result<string>>;
  advancePhase(caseId: string, playerId: string): Promise<Result<string>>;
  canAdvancePhase(caseId: string, playerId: string): Promise<Result<boolean>>;
  getLocationStatus(caseId: string, playerId: string, locationId: string): Promise<Result<boolean>>;
}
