import type { BaseRepository, QueryOptions, PaginatedResult } from "./base-repository";
import type { Result } from "../results/result";
import type { FullCase, CaseDefinition } from "../../types/case";
import type { CaseDifficulty, CaseStatus } from "../enums";

export interface CaseRepository extends BaseRepository<FullCase> {
  findByStatus(status: CaseStatus): Promise<Result<FullCase[]>>;
  findByDifficulty(difficulty: CaseDifficulty): Promise<Result<FullCase[]>>;
  findAvailable(playerId: string): Promise<Result<FullCase[]>>;
  findInProgress(playerId: string): Promise<Result<FullCase[]>>;
  findCompleted(playerId: string): Promise<Result<FullCase[]>>;
  findPaginated(options: QueryOptions): Promise<Result<PaginatedResult<FullCase>>>;
  getDefinition(caseId: string): Promise<Result<CaseDefinition>>;
  getAllDefinitions(): Promise<Result<CaseDefinition[]>>;
  search(query: string, options?: QueryOptions): Promise<Result<PaginatedResult<FullCase>>>;
  lockCase(caseId: string, playerId: string): Promise<Result<FullCase>>;
  unlockCase(caseId: string, playerId: string): Promise<Result<FullCase>>;
  startCase(caseId: string, playerId: string): Promise<Result<FullCase>>;
  completeCase(caseId: string, playerId: string, score: number): Promise<Result<FullCase>>;
  failCase(caseId: string, playerId: string): Promise<Result<FullCase>>;
  resetCase(caseId: string, playerId: string): Promise<Result<FullCase>>;
}
