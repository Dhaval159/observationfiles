import type { FullEvidence, EvidenceRelationship, EvidenceDefinition } from "@/types/evidence";

export interface EvidenceEngineState {
  evidence: Map<string, FullEvidence>;
  inventory: Set<string>;
  discoveredCount: number;
  totalCount: number;
  analyzedCount: number;
  keyEvidenceCount: number;
  filters: EvidenceFilters;
  sortBy: EvidenceSortField;
  sortOrder: "asc" | "desc";
}

export interface EvidenceFilters {
  type: string[] | null;
  category: string[] | null;
  collected: boolean | null;
  analyzed: boolean | null;
  isKey: boolean | null;
  location: string | null;
  tags: string[] | null;
  searchQuery: string;
}

export type EvidenceSortField =
  "name" | "type" | "category" | "collectedAt" | "analyzedAt" | "confidenceLevel";

export interface EvidenceCollectionResult {
  evidence: FullEvidence;
  wasNew: boolean;
  relatedUnlocks: string[];
  observationsUnlocked: string[];
}

export interface EvidenceAnalysisResult {
  evidence: FullEvidence;
  confidenceChange: number;
  relatedEvidenceRevealed: string[];
  contradictionsFound: string[];
}

export type { FullEvidence, EvidenceRelationship, EvidenceDefinition };
