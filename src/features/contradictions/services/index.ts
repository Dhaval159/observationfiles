import type { EventEmitter } from "@/types/engine";
import type {
  Statement,
  Contradiction,
  ContradictionResolution,
  ContradictionValidator,
  ValidationContext,
} from "@/types/contradiction";
import type { ContradictionEngineState, ContradictionCheckResult } from "../types";

export class ContradictionEngine {
  private emitter: EventEmitter;
  private state: ContradictionEngineState;

  constructor(emitter: EventEmitter) {
    this.emitter = emitter;
    this.state = {
      statements: new Map(),
      contradictions: new Map(),
      validators: new Map(),
      discoveredContradictions: new Set(),
    };
    this.registerBuiltInValidators();
  }

  private registerBuiltInValidators(): void {
    this.registerValidator({
      id: "direct_contradiction",
      name: "Direct Contradiction",
      description: "Checks if two statements have opposite truth values about the same event",
      validate: (statementA, statementB, _context) => {
        if (statementA.npcId === statementB.npcId) return null;
        if (statementA.truthValue === "true" && statementB.truthValue === "false") {
          return this.buildContradiction(
            statementA.id,
            statementB.id,
            "direct_contradiction",
            "Direct contradiction: opposing truth values",
            "major",
            50,
          );
        }
        if (statementA.truthValue === "false" && statementB.truthValue === "true") {
          return this.buildContradiction(
            statementA.id,
            statementB.id,
            "direct_contradiction",
            "Direct contradiction: opposing truth values",
            "major",
            50,
          );
        }
        return null;
      },
    });

    this.registerValidator({
      id: "timeline_conflict",
      name: "Timeline Conflict",
      description: "Checks if statements reference timeline events that don't match times",
      validate: (statementA, statementB, context) => {
        const timelineRefsA = statementA.references.filter((r) => r.type === "timeline_event");
        const timelineRefsB = statementB.references.filter((r) => r.type === "timeline_event");

        for (const refA of timelineRefsA) {
          for (const refB of timelineRefsB) {
            if (refA.targetId === refB.targetId) {
              const eventData = context.timeline.get(refA.targetId) as
                Record<string, unknown> | undefined;
              if (eventData) {
                const aTime = eventData[`${statementA.id}_time`] as string | undefined;
                const bTime = eventData[`${statementB.id}_time`] as string | undefined;
                if (aTime && bTime && aTime !== bTime) {
                  return this.buildContradiction(
                    statementA.id,
                    statementB.id,
                    "timeline_conflict",
                    `Timeline conflict on event "${refA.targetId}": differing times`,
                    "critical",
                    75,
                  );
                }
              }
            }
          }
        }
        return null;
      },
    });

    this.registerValidator({
      id: "evidence_conflict",
      name: "Evidence Conflict",
      description: "Checks if a statement references evidence that contradicts the statement",
      validate: (statementA, statementB, context) => {
        const evidenceRefsA = statementA.references.filter((r) => r.type === "evidence");
        const evidenceRefsB = statementB.references.filter((r) => r.type === "evidence");

        for (const refA of evidenceRefsA) {
          for (const refB of evidenceRefsB) {
            if (refA.targetId === refB.targetId) {
              const isDenyA = refA.relationship === "denies" || refA.relationship === "disputes";
              const isDenyB = refB.relationship === "denies" || refB.relationship === "disputes";
              if (isDenyA !== isDenyB) {
                return this.buildContradiction(
                  statementA.id,
                  statementB.id,
                  "evidence_conflict",
                  `Evidence conflict on evidence "${refA.targetId}"`,
                  "moderate",
                  40,
                );
              }
            }
          }
        }
        return null;
      },
    });

    this.registerValidator({
      id: "alibi_conflict",
      name: "Alibi Conflict",
      description: "Checks if two NPCs claim to be in the same place at the same time",
      validate: (statementA, statementB, _context) => {
        const alibisA = statementA.references.filter((r) => r.relationship === "alibis");
        const alibisB = statementB.references.filter((r) => r.relationship === "alibis");

        for (const refA of alibisA) {
          for (const refB of alibisB) {
            if (refA.type === "location" && refB.type === "location") {
              if (refA.targetId === refB.targetId && statementA.npcId !== statementB.npcId) {
                return this.buildContradiction(
                  statementA.id,
                  statementB.id,
                  "alibi_conflict",
                  `Alibi conflict: both NPCs claim to be at location "${refA.targetId}"`,
                  "critical",
                  100,
                );
              }
            }
          }
        }
        return null;
      },
    });

    this.registerValidator({
      id: "witness_discrepancy",
      name: "Witness Discrepancy",
      description: "Checks if two witness accounts of the same event differ significantly",
      validate: (statementA, statementB, _context) => {
        const witnessesA = statementA.references.filter((r) => r.relationship === "witnessed");
        const witnessesB = statementB.references.filter((r) => r.relationship === "witnessed");

        for (const refA of witnessesA) {
          for (const refB of witnessesB) {
            if (refA.targetId === refB.targetId && refA.type === refB.type) {
              if (statementA.npcId !== statementB.npcId) {
                return this.buildContradiction(
                  statementA.id,
                  statementB.id,
                  "witness_discrepancy",
                  `Witness discrepancy: different accounts of event "${refA.targetId}"`,
                  "moderate",
                  30,
                );
              }
            }
          }
        }
        return null;
      },
    });
  }

  private buildContradiction(
    statementA: string,
    statementB: string,
    type: Contradiction["type"],
    description: string,
    severity: Contradiction["severity"],
    scoreValue: number,
  ): Contradiction {
    const id = `contra-${statementA}-${statementB}-${type}`;
    return {
      id,
      statementA,
      statementB,
      type,
      description,
      severity,
      resolution: null,
      isDiscovered: false,
      discoveredAt: null,
      autoDetected: true,
      requiresEvidence: [],
      scoreValue,
    };
  }

  registerValidator(validator: ContradictionValidator): void {
    this.state.validators.set(validator.id, validator);
  }

  loadStatements(statements: Statement[]): void {
    this.state.statements.clear();
    for (const statement of statements) {
      this.state.statements.set(statement.id, statement);
    }
  }

  addStatement(statement: Statement): void {
    this.state.statements.set(statement.id, statement);
  }

  getStatement(statementId: string): Statement | null {
    return this.state.statements.get(statementId) ?? null;
  }

  getNPCStatements(npcId: string): Statement[] {
    const statements: Statement[] = [];
    for (const s of this.state.statements.values()) {
      if (s.npcId === npcId) {
        statements.push(s);
      }
    }
    return statements;
  }

  checkContradictions(statementAId: string, statementBId: string): ContradictionCheckResult {
    const statementA = this.state.statements.get(statementAId);
    const statementB = this.state.statements.get(statementBId);

    if (!statementA || !statementB) {
      return {
        statementA: statementA!,
        statementB: statementB!,
        contradictions: [],
        hasContradiction: false,
      };
    }

    const context: ValidationContext = {
      evidence: new Map(),
      observations: new Map(),
      timeline: new Map(),
      statements: new Map(),
      npcs: new Map(),
    };

    const contradictions: Contradiction[] = [];
    for (const validator of this.state.validators.values()) {
      const result = validator.validate(statementA, statementB, context);
      if (result) {
        if (!this.state.contradictions.has(result.id)) {
          this.state.contradictions.set(result.id, result);
        }
        contradictions.push(result);
      }
    }

    for (const c of contradictions) {
      if (!this.state.discoveredContradictions.has(c.id)) {
        this.state.discoveredContradictions.add(c.id);
        c.isDiscovered = true;
        c.discoveredAt = new Date().toISOString();
        this.emitter.emit("contradiction_found", { contradictionId: c.id });
      }
    }

    return {
      statementA,
      statementB,
      contradictions,
      hasContradiction: contradictions.length > 0,
    };
  }

  checkAllContradictions(): Contradiction[] {
    const statementIds = Array.from(this.state.statements.keys());
    const allContradictions: Contradiction[] = [];

    for (let i = 0; i < statementIds.length; i++) {
      const idA = statementIds[i]!;
      for (let j = i + 1; j < statementIds.length; j++) {
        const idB = statementIds[j]!;
        const result = this.checkContradictions(idA, idB);
        allContradictions.push(...result.contradictions);
      }
    }

    return allContradictions;
  }

  checkStatementAgainstAll(statementId: string): Contradiction[] {
    const allContradictions: Contradiction[] = [];
    for (const [id] of this.state.statements) {
      if (id !== statementId) {
        const result = this.checkContradictions(statementId, id);
        allContradictions.push(...result.contradictions);
      }
    }
    return allContradictions;
  }

  checkStatementAgainstEvidence(
    statementId: string,
    evidenceStates: Map<string, unknown>,
  ): Contradiction[] {
    const statement = this.state.statements.get(statementId);
    if (!statement) return [];

    const contradictions: Contradiction[] = [];
    const evidenceRefs = statement.references.filter((r) => r.type === "evidence");

    for (const ref of evidenceRefs) {
      const evidenceState = evidenceStates.get(ref.targetId);
      if (evidenceState && ref.relationship === "denies") {
        const c = this.buildContradiction(
          statementId,
          `evidence-${ref.targetId}`,
          "evidence_conflict",
          `Statement ${statementId} denies evidence ${ref.targetId}`,
          "moderate",
          30,
        );
        this.state.contradictions.set(c.id, c);
        contradictions.push(c);
      }
    }

    return contradictions;
  }

  checkStatementAgainstTimeline(
    statementId: string,
    timelineEvents: Map<string, unknown>,
  ): Contradiction[] {
    const statement = this.state.statements.get(statementId);
    if (!statement) return [];

    const contradictions: Contradiction[] = [];
    const timelineRefs = statement.references.filter((r) => r.type === "timeline_event");

    for (const ref of timelineRefs) {
      const timelineEvent = timelineEvents.get(ref.targetId);
      if (timelineEvent && ref.relationship === "disputes") {
        const c = this.buildContradiction(
          statementId,
          `timeline-${ref.targetId}`,
          "timeline_conflict",
          `Statement ${statementId} disputes timeline event ${ref.targetId}`,
          "major",
          50,
        );
        this.state.contradictions.set(c.id, c);
        contradictions.push(c);
      }
    }

    return contradictions;
  }

  getContradiction(contradictionId: string): Contradiction | null {
    return this.state.contradictions.get(contradictionId) ?? null;
  }

  getAllContradictions(): Contradiction[] {
    return Array.from(this.state.contradictions.values());
  }

  getDiscoveredContradictions(): Contradiction[] {
    return Array.from(this.state.contradictions.values()).filter((c) =>
      this.state.discoveredContradictions.has(c.id),
    );
  }

  getUndiscoveredContradictions(): Contradiction[] {
    return Array.from(this.state.contradictions.values()).filter(
      (c) => !this.state.discoveredContradictions.has(c.id),
    );
  }

  discoverContradiction(contradictionId: string): void {
    const contradiction = this.state.contradictions.get(contradictionId);
    if (contradiction) {
      contradiction.isDiscovered = true;
      contradiction.discoveredAt = new Date().toISOString();
      this.state.discoveredContradictions.add(contradictionId);
      this.emitter.emit("contradiction_discovered", { contradictionId });
    }
  }

  resolveContradiction(contradictionId: string, resolution: ContradictionResolution): void {
    const contradiction = this.state.contradictions.get(contradictionId);
    if (contradiction) {
      contradiction.resolution = resolution;
      this.emitter.emit("contradiction_resolved", {
        contradictionId,
        resolutionType: resolution.type,
      });
    }
  }

  getContradictionsForStatement(statementId: string): Contradiction[] {
    return Array.from(this.state.contradictions.values()).filter(
      (c) => c.statementA === statementId || c.statementB === statementId,
    );
  }

  getContradictionsForNPC(npcId: string): Contradiction[] {
    const npcStatements = this.getNPCStatements(npcId);
    const statementIds = new Set(npcStatements.map((s) => s.id));

    return Array.from(this.state.contradictions.values()).filter(
      (c) => statementIds.has(c.statementA) || statementIds.has(c.statementB),
    );
  }

  getContradictionScore(): number {
    return this.getDiscoveredContradictions().reduce((sum, c) => sum + c.scoreValue, 0);
  }

  serialize(): string {
    const data = {
      statements: Array.from(this.state.statements.entries()),
      contradictions: Array.from(this.state.contradictions.entries()),
      discoveredContradictions: Array.from(this.state.discoveredContradictions),
      validatorIds: Array.from(this.state.validators.keys()),
    };
    return JSON.stringify(data, (_, v) => (v instanceof Map ? Array.from(v) : v));
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.state.statements = new Map(parsed.statements);
    this.state.contradictions = new Map(parsed.contradictions);
    this.state.discoveredContradictions = new Set(parsed.discoveredContradictions);
  }

  reset(): void {
    this.state = {
      statements: new Map(),
      contradictions: new Map(),
      validators: this.state.validators,
      discoveredContradictions: new Set(),
    };
  }
}
