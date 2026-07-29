import type { Result } from "../results/result";
import type { FullEvidence, EvidenceDefinition } from "../../types/evidence";

export interface IEvidenceEngine {
  readonly id: string;
  readonly name: string;

  getEvidence(caseId: string, playerId: string): Promise<Result<FullEvidence[]>>;
  getEvidenceItem(evidenceId: string, playerId: string): Promise<Result<FullEvidence>>;
  getDefinition(evidenceId: string): Promise<Result<EvidenceDefinition>>;
  getDefinitionsForCase(caseId: string): Promise<Result<EvidenceDefinition[]>>;
  collectEvidence(caseId: string, evidenceId: string, locationId: string, playerId: string): Promise<Result<FullEvidence>>;
  analyzeEvidence(evidenceId: string, playerId: string, notes: string): Promise<Result<FullEvidence>>;
  canCollect(caseId: string, evidenceId: string, playerId: string): Promise<Result<boolean>>;
  getUncollectedEvidence(caseId: string, playerId: string): Promise<Result<EvidenceDefinition[]>>;
  getKeyEvidence(caseId: string, playerId: string): Promise<Result<FullEvidence[]>>;
  getEvidenceByType(caseId: string, playerId: string, type: string): Promise<Result<FullEvidence[]>>;
  getEvidenceByLocation(caseId: string, locationId: string, playerId: string): Promise<Result<FullEvidence[]>>;
  isEvidenceCollected(caseId: string, evidenceId: string, playerId: string): Promise<Result<boolean>>;
  getCollectionProgress(caseId: string, playerId: string): Promise<Result<{ collected: number; total: number; percentage: number }>>;
}
