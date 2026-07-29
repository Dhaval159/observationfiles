import type { EventEmitter } from "@/types/engine";
import type { FullEvidence, EvidenceRelationship } from "@/types/evidence";
import type {
  EvidenceEngineState,
  EvidenceFilters,
  EvidenceSortField,
  EvidenceCollectionResult,
  EvidenceAnalysisResult,
} from "../types";
import {
  filterEvidenceItems,
  sortEvidenceItems,
  searchEvidenceItems,
  validateEvidenceLink,
} from "../utils";

export class EvidenceEngine {
  private emitter: EventEmitter;
  private state: EvidenceEngineState;

  constructor(emitter: EventEmitter) {
    this.emitter = emitter;
    this.state = {
      evidence: new Map(),
      inventory: new Set(),
      discoveredCount: 0,
      totalCount: 0,
      analyzedCount: 0,
      keyEvidenceCount: 0,
      filters: {
        type: null,
        category: null,
        collected: null,
        analyzed: null,
        isKey: null,
        location: null,
        tags: null,
        searchQuery: "",
      },
      sortBy: "name",
      sortOrder: "asc",
    };
  }

  getState(): EvidenceEngineState {
    return this.state;
  }

  loadEvidence(evidenceList: FullEvidence[]): void {
    this.state.evidence.clear();
    this.state.inventory.clear();
    this.state.totalCount = evidenceList.length;
    this.state.keyEvidenceCount = 0;
    this.state.discoveredCount = 0;
    this.state.analyzedCount = 0;

    for (const evidence of evidenceList) {
      this.state.evidence.set(evidence.id, evidence);
      if (evidence.isKey) {
        this.state.keyEvidenceCount++;
      }
      if (evidence.collectedAt) {
        this.state.discoveredCount++;
        this.state.inventory.add(evidence.id);
      }
      if (evidence.analyzedAt) {
        this.state.analyzedCount++;
      }
    }
  }

  getEvidence(evidenceId: string): FullEvidence | null {
    return this.state.evidence.get(evidenceId) ?? null;
  }

  getAllEvidence(): FullEvidence[] {
    return Array.from(this.state.evidence.values());
  }

  collectEvidence(evidenceId: string): EvidenceCollectionResult {
    const evidence = this.state.evidence.get(evidenceId);
    if (!evidence) {
      throw new Error(`Evidence "${evidenceId}" not found`);
    }

    const wasNew = !evidence.collectedAt;
    const now = new Date().toISOString();

    const relatedUnlocks: string[] = [];
    const observationsUnlocked: string[] = [];

    if (wasNew) {
      for (const [id, item] of this.state.evidence) {
        if (item.collectedAt) continue;

        const unlockCondition = item.unlockCondition;
        if (isUnlockConditionMet(unlockCondition, evidenceId)) {
          relatedUnlocks.push(id);
        }
      }
    }

    const updated: FullEvidence = {
      ...evidence,
      collectedAt: evidence.collectedAt ?? now,
      discoveredAt: evidence.discoveredAt ?? now,
      inventory: true,
    };

    this.state.evidence.set(evidenceId, updated);
    this.state.inventory.add(evidenceId);

    if (wasNew) {
      this.state.discoveredCount++;
    }

    this.emitter.emit("evidence_collected", {
      evidenceId,
      wasNew,
      relatedUnlocks,
      observationsUnlocked,
      collectedAt: now,
    });

    return {
      evidence: updated,
      wasNew,
      relatedUnlocks,
      observationsUnlocked,
    };
  }

  analyzeEvidence(evidenceId: string, notes?: string): EvidenceAnalysisResult {
    const evidence = this.state.evidence.get(evidenceId);
    if (!evidence) {
      throw new Error(`Evidence "${evidenceId}" not found`);
    }

    const now = new Date().toISOString();
    const wasNew = !evidence.analyzedAt;

    const relatedEvidenceRevealed: string[] = [];
    const contradictionsFound: string[] = [];

    for (const rel of evidence.relatedEvidence) {
      if (rel.relationshipType === "contradicts" || rel.relationshipType === "disproves") {
        contradictionsFound.push(rel.targetId);
      }
      if (
        rel.relationshipType === "supports" ||
        rel.relationshipType === "proves" ||
        rel.relationshipType === "relates_to"
      ) {
        relatedEvidenceRevealed.push(rel.targetId);
      }
    }

    const confidenceChange = wasNew ? 10 : 0;
    const updated: FullEvidence = {
      ...evidence,
      analyzedAt: evidence.analyzedAt ?? now,
      analysisNotes: notes ?? evidence.analysisNotes,
      confidenceLevel: evidence.confidenceLevel + confidenceChange,
    };

    this.state.evidence.set(evidenceId, updated);

    if (wasNew) {
      this.state.analyzedCount++;
    }

    this.emitter.emit("evidence_analyzed", {
      evidenceId,
      confidenceChange,
      relatedEvidenceRevealed,
      contradictionsFound,
      analyzedAt: now,
    });

    return {
      evidence: updated,
      confidenceChange,
      relatedEvidenceRevealed,
      contradictionsFound,
    };
  }

  isEvidenceCollectible(evidenceId: string, context: Record<string, unknown>): boolean {
    const evidence = this.state.evidence.get(evidenceId);
    if (!evidence) return false;
    if (evidence.collectedAt) return false;

    const unlockCondition = evidence.unlockCondition;
    if (!unlockCondition) return true;

    return evaluateUnlockCondition(unlockCondition, context);
  }

  getCollectibleEvidence(context: Record<string, unknown>): FullEvidence[] {
    const result: FullEvidence[] = [];
    for (const evidence of this.state.evidence.values()) {
      if (!evidence.collectedAt && this.isEvidenceCollectible(evidence.id, context)) {
        result.push(evidence);
      }
    }
    return result;
  }

  getInventory(): FullEvidence[] {
    const result: FullEvidence[] = [];
    for (const id of this.state.inventory) {
      const evidence = this.state.evidence.get(id);
      if (evidence) {
        result.push(evidence);
      }
    }
    return result;
  }

  isInInventory(evidenceId: string): boolean {
    return this.state.inventory.has(evidenceId);
  }

  removeFromInventory(evidenceId: string): void {
    this.state.inventory.delete(evidenceId);
  }

  getEvidenceAtLocation(locationId: string): FullEvidence[] {
    const result: FullEvidence[] = [];
    for (const evidence of this.state.evidence.values()) {
      if (evidence.location === locationId) {
        result.push(evidence);
      }
    }
    return result;
  }

  getKeyEvidence(): FullEvidence[] {
    const result: FullEvidence[] = [];
    for (const evidence of this.state.evidence.values()) {
      if (evidence.isKey) {
        result.push(evidence);
      }
    }
    return result;
  }

  getRelatedEvidence(evidenceId: string): EvidenceRelationship[] {
    const evidence = this.state.evidence.get(evidenceId);
    if (!evidence) return [];
    return evidence.relatedEvidence;
  }

  linkEvidence(sourceId: string, targetId: string, relationshipType: string): void {
    const source = this.state.evidence.get(sourceId);
    const target = this.state.evidence.get(targetId);
    if (!source || !target) return;

    if (!validateEvidenceLink(source, target, relationshipType)) {
      return;
    }

    const relationship: EvidenceRelationship = {
      sourceId,
      targetId,
      relationshipType: relationshipType as EvidenceRelationship["relationshipType"],
    };

    const updatedRelated = [...source.relatedEvidence, relationship];
    this.state.evidence.set(sourceId, {
      ...source,
      relatedEvidence: updatedRelated,
    });

    this.emitter.emit("evidence_linked", {
      sourceId,
      targetId,
      relationshipType,
    });
  }

  getEvidenceByTag(tag: string): FullEvidence[] {
    const result: FullEvidence[] = [];
    for (const evidence of this.state.evidence.values()) {
      if (evidence.tags.some((t) => t.name === tag)) {
        result.push(evidence);
      }
    }
    return result;
  }

  getEvidenceByCategory(category: string): FullEvidence[] {
    const result: FullEvidence[] = [];
    for (const evidence of this.state.evidence.values()) {
      if (evidence.category === category) {
        result.push(evidence);
      }
    }
    return result;
  }

  getEvidenceByType(type: string): FullEvidence[] {
    const result: FullEvidence[] = [];
    for (const evidence of this.state.evidence.values()) {
      if (evidence.type === type) {
        result.push(evidence);
      }
    }
    return result;
  }

  searchEvidence(query: string): FullEvidence[] {
    const all = Array.from(this.state.evidence.values());
    return searchEvidenceItems(all, query);
  }

  filterEvidence(filters: Partial<EvidenceFilters>): FullEvidence[] {
    const all = Array.from(this.state.evidence.values());
    return filterEvidenceItems(all, filters);
  }

  sortEvidence(field: EvidenceSortField, order: "asc" | "desc"): FullEvidence[] {
    const all = Array.from(this.state.evidence.values());
    return sortEvidenceItems(all, field, order);
  }

  getEvidenceProgress(): {
    collected: number;
    total: number;
    percentage: number;
    keyCollected: number;
    keyTotal: number;
    analyzed: number;
  } {
    const { discoveredCount, totalCount, keyEvidenceCount, analyzedCount } = this.state;

    let keyCollected = 0;
    for (const id of this.state.inventory) {
      const evidence = this.state.evidence.get(id);
      if (evidence?.isKey) {
        keyCollected++;
      }
    }

    return {
      collected: discoveredCount,
      total: totalCount,
      percentage: totalCount > 0 ? (discoveredCount / totalCount) * 100 : 0,
      keyCollected,
      keyTotal: keyEvidenceCount,
      analyzed: analyzedCount,
    };
  }

  getEvidenceConfidence(evidenceId: string): number {
    const evidence = this.state.evidence.get(evidenceId);
    return evidence?.confidenceLevel ?? 0;
  }

  serialize(): string {
    const data = {
      evidence: Array.from(this.state.evidence.entries()),
      inventory: Array.from(this.state.inventory),
      discoveredCount: this.state.discoveredCount,
      analyzedCount: this.state.analyzedCount,
      filters: this.state.filters,
      sortBy: this.state.sortBy,
      sortOrder: this.state.sortOrder,
    };
    return JSON.stringify(data);
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);

    this.state.evidence = new Map(parsed.evidence);
    this.state.inventory = new Set(parsed.inventory);
    this.state.discoveredCount = parsed.discoveredCount ?? 0;
    this.state.analyzedCount = parsed.analyzedCount ?? 0;

    if (parsed.filters) {
      this.state.filters = parsed.filters;
    }
    if (parsed.sortBy) {
      this.state.sortBy = parsed.sortBy;
    }
    if (parsed.sortOrder) {
      this.state.sortOrder = parsed.sortOrder;
    }

    this.state.totalCount = this.state.evidence.size;
    this.state.keyEvidenceCount = 0;
    for (const evidence of this.state.evidence.values()) {
      if (evidence.isKey) {
        this.state.keyEvidenceCount++;
      }
    }
  }

  reset(): void {
    this.state.evidence.clear();
    this.state.inventory.clear();
    this.state.discoveredCount = 0;
    this.state.totalCount = 0;
    this.state.analyzedCount = 0;
    this.state.keyEvidenceCount = 0;
    this.state.filters = {
      type: null,
      category: null,
      collected: null,
      analyzed: null,
      isKey: null,
      location: null,
      tags: null,
      searchQuery: "",
    };
    this.state.sortBy = "name";
    this.state.sortOrder = "asc";
  }
}

function isUnlockConditionMet(
  unlockCondition: Record<string, unknown> | null,
  evidenceId: string,
): boolean {
  if (!unlockCondition) return true;
  if (unlockCondition["type"] === "evidence_collected") {
    return unlockCondition["targetId"] === evidenceId;
  }
  return false;
}

function evaluateUnlockCondition(
  unlockCondition: Record<string, unknown>,
  context: Record<string, unknown>,
): boolean {
  const type = unlockCondition["type"] as string | undefined;
  if (!type) return false;

  const contextValue = context[type];
  const targetId = unlockCondition["targetId"];

  if (targetId !== undefined) {
    if (Array.isArray(contextValue)) {
      return contextValue.includes(targetId);
    }
    if (contextValue instanceof Set) {
      return contextValue.has(targetId);
    }
    return false;
  }

  return contextValue !== undefined && contextValue !== null;
}
