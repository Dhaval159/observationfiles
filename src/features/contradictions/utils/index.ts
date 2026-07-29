import type { Statement, Contradiction, StatementReference } from "@/types/contradiction";

export function statementsContradict(a: Statement, b: Statement): boolean {
  if (a.id === b.id) return false;
  if (a.npcId === b.npcId) {
    if (a.truthValue === "true" && b.truthValue === "false") return true;
    if (a.truthValue === "false" && b.truthValue === "true") return true;
  }
  return getConflictingReferences(a, b).length > 0;
}

export function getConflictingReferences(
  aStatement: Statement,
  bStatement: Statement,
): { aRef: StatementReference; bRef: StatementReference }[] {
  const conflicts: { aRef: StatementReference; bRef: StatementReference }[] = [];

  for (const aRef of aStatement.references) {
    for (const bRef of bStatement.references) {
      if (aRef.type === bRef.type && aRef.targetId === bRef.targetId) {
        const conflictingRelationships = ["denies", "disputes"];
        const supportiveRelationships = ["confirms"];

        const aIsConflict = conflictingRelationships.some((r) => aRef.relationship === r);
        const bIsConflict = conflictingRelationships.some((r) => bRef.relationship === r);
        const aIsSupportive = supportiveRelationships.some((r) => aRef.relationship === r);
        const bIsSupportive = supportiveRelationships.some((r) => bRef.relationship === r);

        if ((aIsConflict && bIsSupportive) || (aIsSupportive && bIsConflict)) {
          conflicts.push({ aRef, bRef });
        }
      }
    }
  }

  return conflicts;
}

export function categorizeContradictions(
  contradictions: Contradiction[],
): Record<string, Contradiction[]> {
  const categories: Record<string, Contradiction[]> = {};
  for (const c of contradictions) {
    if (!categories[c.type]) {
      categories[c.type] = [];
    }
    categories[c.type]!.push(c);
  }
  return categories;
}

export function getContradictionSeverityOrder(): Record<string, number> {
  return {
    minor: 1,
    moderate: 2,
    major: 3,
    critical: 4,
  };
}

export function formatContradictionDescription(
  contradiction: Contradiction,
  statements: Map<string, Statement>,
): string {
  const stmtA = statements.get(contradiction.statementA);
  const stmtB = statements.get(contradiction.statementB);

  if (!stmtA || !stmtB) {
    return contradiction.description;
  }

  return `[${contradiction.type}] ${contradiction.description} (${stmtA.npcId} vs ${stmtB.npcId})`;
}
