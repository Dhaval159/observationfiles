import type { DomainTimestamp } from "@/domain/value-objects/timestamp";
import type { DomainDifficulty } from "@/domain/value-objects/difficulty";
import type { Priority } from "@/domain/value-objects/priority";
import type { Requirement, RequirementSet } from "@/domain/models/unlock-condition";
import type { ObservationCategory, ObservationVisibility } from "@/domain/enums";

export type ObservationLifecycleState =
  | "hidden"
  | "available"
  | "inspecting"
  | "observed"
  | "verified"
  | "rejected"
  | "locked"
  | "archived";

export interface ObservationLifecycleSnapshot {
  readonly state: ObservationLifecycleState;
  readonly previousState: ObservationLifecycleState;
  readonly timestamp: DomainTimestamp;
  readonly source: string;
  readonly metadata?: Record<string, unknown>;
}

export interface ObservationRequirementDefinition {
  readonly requirements: Requirement[];
  readonly sets: RequirementSet[];
  readonly requiredCount: number;
  readonly combinator: "all" | "any" | "at_least";
}

export interface ObservationDependencyDefinition {
  readonly id: string;
  readonly dependsOnId: string;
  readonly dependencyType:
    "requires" | "enhances" | "contradicts" | "supersedes" | "precedes" | "follows";
  readonly description: string;
  readonly isBidirectional: boolean;
  readonly isMandatory: boolean;
}

export interface ObservationDependencyNode {
  readonly observationId: string;
  readonly dependencies: ObservationDependencyDefinition[];
  readonly dependents: string[];
  readonly isSatisfied: boolean;
  readonly satisfiedAt: DomainTimestamp | null;
}

export interface ObservationConfidenceRecord {
  readonly observationId: string;
  readonly value: number;
  readonly percentage: number;
  readonly category: "very_low" | "low" | "medium" | "high" | "very_high" | "certain";
  readonly isMediumOrHigher: boolean;
  readonly isHigh: boolean;
  readonly history: ConfidenceSnapshot[];
  readonly lastUpdated: DomainTimestamp;
}

export interface ConfidenceSnapshot {
  readonly value: number;
  readonly source: string;
  readonly timestamp: DomainTimestamp;
  readonly reason?: string;
}

export interface ObservationGroupDefinition {
  readonly id: string;
  readonly caseId: string;
  readonly name: string;
  readonly description: string;
  readonly observationIds: string[];
  readonly requiredCount: number;
  readonly parentGroupId: string | null;
  readonly childGroupIds: string[];
  readonly order: number;
  readonly tags: string[];
  readonly isVirtual: boolean;
  readonly filterExpression: string | null;
}

export interface ObservationGroupState {
  readonly groupId: string;
  readonly observedCount: number;
  readonly totalCount: number;
  readonly isComplete: boolean;
  readonly completedAt: DomainTimestamp | null;
  readonly observationStates: Record<string, ObservationLifecycleState>;
}

export interface ObservationEntry {
  readonly id: string;
  readonly caseId: string;
  readonly definition: ObservationObjectDefinition;
  readonly lifecycleState: ObservationLifecycleState;
  readonly lifecycleHistory: ObservationLifecycleSnapshot[];
  readonly confidence: ObservationConfidenceRecord;
  readonly dependencies: ObservationDependencyNode;
  readonly groupIds: string[];
  readonly discoveredAt: DomainTimestamp | null;
  readonly observedAt: DomainTimestamp | null;
  readonly verifiedAt: DomainTimestamp | null;
  readonly rejectedAt: DomainTimestamp | null;
  readonly lockedAt: DomainTimestamp | null;
  readonly archivedAt: DomainTimestamp | null;
  readonly playerNotes: string;
  readonly observationCount: number;
  readonly isPinned: boolean;
  readonly runtimeMetadata: Record<string, unknown>;
  readonly createdAt: DomainTimestamp;
  readonly updatedAt: DomainTimestamp;
}

export interface ObservationObjectDefinition {
  readonly id: string;
  readonly caseId: string;
  readonly sourceObjectId: string;
  readonly locationId: string;
  readonly category: ObservationCategory;
  readonly title: string;
  readonly description: string;
  readonly detailedDescription: string;
  readonly visibility: ObservationVisibility;
  readonly requirements: ObservationRequirementDefinition;
  readonly dependencyDefs: ObservationDependencyDefinition[];
  readonly confidenceGain: number;
  readonly unlocksObservations: string[];
  readonly tags: string[];
  readonly order: number;
  readonly priority: Priority;
  readonly difficulty: DomainDifficulty;
  readonly isCritical: boolean;
  readonly xpReward: number;
  readonly maxObservationCount: number;
  readonly isHidden: boolean;
  readonly hiddenRequirements: ObservationRequirementDefinition;
  readonly interactionPrompt: string;
  readonly relatedEvidenceIds: string[];
  readonly relatedStatementIds: string[];
  readonly relatedTimelineIds: string[];
  readonly relatedTheoryIds: string[];
  readonly metadata: Record<string, unknown>;
}

export interface ObservationDiscoveryEntry {
  readonly id: string;
  readonly observationId: string;
  readonly discoveredAt: DomainTimestamp;
  readonly locationId: string;
  readonly playerAction: string;
  readonly source: string;
  readonly previousState: ObservationLifecycleState;
  readonly newState: ObservationLifecycleState;
  readonly metadata: Record<string, unknown>;
}

export interface ObservationContext {
  readonly id: string;
  readonly caseId: string;
  readonly playerId: string;

  entries: Map<string, ObservationEntry>;
  definitions: Map<string, ObservationObjectDefinition>;
  groups: Map<string, ObservationGroupDefinition>;
  groupStates: Map<string, ObservationGroupState>;
  dependencyNodes: Map<string, ObservationDependencyNode>;
  confidenceRecords: Map<string, ObservationConfidenceRecord>;
  discoveryHistory: ObservationDiscoveryEntry[];

  currentObservationId: string | null;
  lifecycleState: ObservationLifecycleState;
  lifecycleHistory: ObservationLifecycleSnapshot[];

  runtimeVariables: Map<string, unknown>;
  playerFlags: Map<string, unknown>;
  temporaryCache: Map<string, unknown>;

  isPaused: boolean;
  isComplete: boolean;

  createdAt: DomainTimestamp;
  updatedAt: DomainTimestamp;
  startedAt: DomainTimestamp | null;
  completedAt: DomainTimestamp | null;
}

export interface ObservationFilterCriteria {
  state?: ObservationLifecycleState | ObservationLifecycleState[];
  category?: ObservationCategory | ObservationCategory[];
  location?: string | string[];
  group?: string | string[];
  tags?: string | string[];
  priority?: Priority;
  difficulty?: DomainDifficulty;
  confidence?: { min?: number; max?: number };
  isCritical?: boolean;
  isPinned?: boolean;
  discoveredBefore?: DomainTimestamp;
  discoveredAfter?: DomainTimestamp;
  observedBefore?: DomainTimestamp;
  observedAfter?: DomainTimestamp;
  custom?: Array<{ field: string; operator: string; value: unknown }>;
}

export interface ObservationSearchCriteria {
  query?: string;
  fields?: string[];
  state?: ObservationLifecycleState | ObservationLifecycleState[];
  category?: ObservationCategory | ObservationCategory[];
  location?: string | string[];
  tags?: string | string[];
  group?: string | string[];
  confidence?: { min?: number; max?: number };
  isCritical?: boolean;
  isPinned?: boolean;
  discoveredAfter?: DomainTimestamp;
  observedAfter?: DomainTimestamp;
}

export type ObservationSortField =
  | "id"
  | "title"
  | "category"
  | "discoveredAt"
  | "observedAt"
  | "priority"
  | "difficulty"
  | "confidence"
  | "order"
  | "updatedAt"
  | "createdAt";

export interface ObservationSortOption {
  readonly field: ObservationSortField;
  readonly direction: "asc" | "desc";
}

export interface ObservationValidationResult {
  isValid: boolean;
  errors: ObservationValidationError[];
  warnings: ObservationValidationWarning[];
}

export interface ObservationValidationError {
  readonly code: string;
  readonly message: string;
  readonly field: string;
  readonly observationId?: string;
}

export interface ObservationValidationWarning {
  readonly code: string;
  readonly message: string;
  readonly field: string;
  readonly observationId?: string;
}

export interface ObservationEngineConfig {
  enableAutoProgress: boolean;
  enableNotifications: boolean;
  enableEventSystem: boolean;
  enableConfidenceTracking: boolean;
  enableDependencyGraph: boolean;
  enableDiscoveryTracking: boolean;
  enableGroupManagement: boolean;
  enableSearch: boolean;
  enableFilters: boolean;
  enableSorting: boolean;
  enableCache: boolean;
  enablePersistence: boolean;
  validateOnRegister: boolean;
  strictValidation: boolean;
  maxDiscoveryHistory: number;
  allowReobservation: boolean;
  allowConfidenceDecay: boolean;
}

export const DEFAULT_OBSERVATION_ENGINE_CONFIG: ObservationEngineConfig = {
  enableAutoProgress: true,
  enableNotifications: true,
  enableEventSystem: true,
  enableConfidenceTracking: true,
  enableDependencyGraph: true,
  enableDiscoveryTracking: true,
  enableGroupManagement: true,
  enableSearch: true,
  enableFilters: true,
  enableSorting: true,
  enableCache: true,
  enablePersistence: true,
  validateOnRegister: true,
  strictValidation: true,
  maxDiscoveryHistory: 1000,
  allowReobservation: true,
  allowConfidenceDecay: false,
};
