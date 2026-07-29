import type { BaseRepository, QueryOptions, PaginatedResult } from "./base-repository";
import type { Result } from "../results/result";
import type { FullEvidence, EvidenceDefinition } from "../../types/evidence";

export interface EvidenceRepository extends BaseRepository<FullEvidence> {
  findByCase(caseId: string): Promise<Result<FullEvidence[]>>;
  findByLocation(caseId: string, locationId: string): Promise<Result<FullEvidence[]>>;
  findByType(caseId: string, type: string): Promise<Result<FullEvidence[]>>;
  findCollected(caseId: string, playerId: string): Promise<Result<FullEvidence[]>>;
  findUncollected(caseId: string, playerId: string): Promise<Result<FullEvidence[]>>;
  findKeyEvidence(caseId: string): Promise<Result<FullEvidence[]>>;
  findHiddenEvidence(caseId: string): Promise<Result<FullEvidence[]>>;
  findPaginated(caseId: string, options: QueryOptions): Promise<Result<PaginatedResult<FullEvidence>>>;
  getDefinition(evidenceId: string): Promise<Result<EvidenceDefinition>>;
  getDefinitionsForCase(caseId: string): Promise<Result<EvidenceDefinition[]>>;
  collectEvidence(caseId: string, evidenceId: string, playerId: string): Promise<Result<FullEvidence>>;
  markAnalyzed(evidenceId: string, notes: string): Promise<Result<FullEvidence>>;
  addToInventory(evidenceId: string): Promise<Result<FullEvidence>>;
  removeFromInventory(evidenceId: string): Promise<Result<FullEvidence>>;
  search(caseId: string, query: string, options?: QueryOptions): Promise<Result<PaginatedResult<FullEvidence>>>;
}
