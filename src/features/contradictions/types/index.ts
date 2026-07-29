import type {
  Statement,
  Contradiction,
  ContradictionValidator,
  ValidationContext,
} from "@/types/contradiction";

export interface ContradictionEngineState {
  statements: Map<string, Statement>;
  contradictions: Map<string, Contradiction>;
  validators: Map<string, ContradictionValidator>;
  discoveredContradictions: Set<string>;
}

export interface ContradictionCheckResult {
  statementA: Statement;
  statementB: Statement;
  contradictions: Contradiction[];
  hasContradiction: boolean;
}

export type { Statement, Contradiction, ContradictionValidator, ValidationContext };
