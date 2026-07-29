export type ContradictionType =
  | "direct_contradiction"
  | "timeline_conflict"
  | "evidence_conflict"
  | "logical_inconsistency"
  | "alibi_conflict"
  | "witness_discrepancy"
  | "motive_conflict"
  | "identity_conflict";

export interface Statement {
  id: string;
  caseId: string;
  npcId: string;
  text: string;
  timestamp: string;
  truthValue: "true" | "false" | "partial" | "unknown";
  references: StatementReference[];
  sourceNodeId: string | null;
  metadata: Record<string, unknown>;
}

export interface StatementReference {
  type: "evidence" | "observation" | "timeline_event" | "statement" | "location" | "npc";
  targetId: string;
  relationship:
    "mentions" | "confirms" | "denies" | "alibis" | "witnessed" | "implies" | "disputes";
  confidence: number;
}

export interface Contradiction {
  id: string;
  statementA: string;
  statementB: string;
  type: ContradictionType;
  description: string;
  severity: "minor" | "moderate" | "major" | "critical";
  resolution: ContradictionResolution | null;
  isDiscovered: boolean;
  discoveredAt: string | null;
  autoDetected: boolean;
  requiresEvidence: string[];
  scoreValue: number;
}

export interface ContradictionResolution {
  type:
    | "statement_false"
    | "statement_true"
    | "evidence_explains"
    | "timeline_corrected"
    | "misunderstanding"
    | "accomplice_explains";
  resolvingEvidenceId: string | null;
  resolvingStatementId: string | null;
  explanation: string;
}

export interface ContradictionValidator {
  id: string;
  name: string;
  description: string;
  validate: (
    statementA: Statement,
    statementB: Statement,
    context: ValidationContext,
  ) => Contradiction | null;
}

export interface ValidationContext {
  evidence: Map<string, unknown>;
  observations: Map<string, unknown>;
  timeline: Map<string, unknown>;
  statements: Map<string, unknown>;
  npcs: Map<string, unknown>;
}
