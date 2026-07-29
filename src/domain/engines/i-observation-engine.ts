import type { Result } from "../results/result";
import type { ObservationState, ObservationDefinition } from "../../types/observation";
import type { Confidence } from "../value-objects/confidence";

export interface IObservationEngine {
  readonly id: string;
  readonly name: string;

  getObservations(caseId: string, playerId: string): Promise<Result<ObservationState[]>>;
  getObservation(observationId: string, playerId: string): Promise<Result<ObservationState>>;
  getDefinition(observationId: string): Promise<Result<ObservationDefinition>>;
  getDefinitionsForCase(caseId: string): Promise<Result<ObservationDefinition[]>>;
  makeObservation(caseId: string, observationId: string, objectId: string, locationId: string, playerId: string): Promise<Result<ObservationState>>;
  analyzeObservation(observationId: string, playerId: string, notes: string): Promise<Result<ObservationState>>;
  canObserve(caseId: string, observationId: string, playerId: string): Promise<Result<boolean>>;
  getObservableObjects(caseId: string, locationId: string, playerId: string): Promise<Result<ObservationDefinition[]>>;
  getUndiscoveredObservations(caseId: string, playerId: string): Promise<Result<ObservationDefinition[]>>;
  getCriticalObservations(caseId: string, playerId: string): Promise<Result<ObservationDefinition[]>>;
  getObservationConfidence(observationId: string, playerId: string): Promise<Result<Confidence>>;
  validateObservationConditions(caseId: string, observationId: string, playerId: string): Promise<Result<boolean>>;
}
