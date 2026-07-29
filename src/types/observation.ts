export type ObservationCategory =
  "visual" | "auditory" | "tactile" | "analytical" | "deductive" | "contextual" | "behavioral";

export type ObservationVisibility = "visible" | "hidden" | "conditional" | "timed";

export interface ObservationCondition {
  type:
    | "evidence_discovered"
    | "observation_made"
    | "npc_interrogated"
    | "time_reached"
    | "location_visited"
    | "score_threshold"
    | "deduction_made"
    | "statement_verified"
    | "custom";
  targetId: string;
  value?: unknown;
  operator?: "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "exists";
}

export interface ObservationDependency {
  dependsOn: string;
  dependencyType: "requires" | "enhances" | "contradicts" | "supersedes";
  description: string;
}

export interface ObservationDefinition {
  id: string;
  caseId: string;
  objectId: string;
  category: ObservationCategory;
  title: string;
  description: string;
  detailedDescription: string;
  visibility: ObservationVisibility;
  conditions: ObservationCondition[];
  dependencies: ObservationDependency[];
  confidenceGain: number;
  unlocksDeductions: string[];
  tags: string[];
  order: number;
  isCritical: boolean;
  xpReward: number;
}

export interface ObservationState {
  observationId: string;
  isDiscovered: boolean;
  discoveredAt: string | null;
  isAnalyzed: boolean;
  analyzedAt: string | null;
  playerNotes: string;
  confidenceLevel: number;
  isPinned: boolean;
}

export interface ObservationObjectDefinition {
  id: string;
  caseId: string;
  locationId: string;
  name: string;
  description: string;
  observationIds: string[];
  isInteractable: boolean;
  interactPrompt: string;
  imageUrl: string | null;
  unlockCondition: ObservationCondition | null;
}

export interface ObservationSearchCriteria {
  query?: string;
  categories?: ObservationCategory[];
  tags?: string[];
  discovered?: boolean;
  analyzed?: boolean;
  locationId?: string;
  objectId?: string;
  minConfidence?: number;
  isCritical?: boolean;
}
