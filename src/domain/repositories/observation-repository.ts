import type { BaseRepository, QueryOptions, PaginatedResult } from "./base-repository";
import type { Result } from "../results/result";
import type { ObservationDefinition, ObservationState } from "../../types/observation";

export interface ObservationRepository extends BaseRepository<ObservationState> {
  findByCase(caseId: string): Promise<Result<ObservationState[]>>;
  findByObject(caseId: string, objectId: string): Promise<Result<ObservationState[]>>;
  findByLocation(caseId: string, locationId: string): Promise<Result<ObservationState[]>>;
  findDiscovered(caseId: string): Promise<Result<ObservationState[]>>;
  findUndiscovered(caseId: string): Promise<Result<ObservationState[]>>;
  findCritical(caseId: string): Promise<Result<ObservationState[]>>;
  findPaginated(caseId: string, options: QueryOptions): Promise<Result<PaginatedResult<ObservationState>>>;
  getDefinition(observationId: string): Promise<Result<ObservationDefinition>>;
  getDefinitionsForCase(caseId: string): Promise<Result<ObservationDefinition[]>>;
  discoverObservation(caseId: string, observationId: string, playerId: string): Promise<Result<ObservationState>>;
  markAnalyzed(observationId: string, notes: string): Promise<Result<ObservationState>>;
  search(caseId: string, query: string, options?: QueryOptions): Promise<Result<PaginatedResult<ObservationState>>>;
}
