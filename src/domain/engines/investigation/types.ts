import type { DomainTimestamp } from "@/domain/value-objects/timestamp";
import type { Objective } from "@/domain/models/objective";
import type { SearchResult, Filter, FilterGroup } from "@/domain/models/search-result";
import type { Requirement, RequirementSet } from "@/domain/models/unlock-condition";

export type InvestigationLifecycleState =
  | "not_started"
  | "preparing"
  | "exploring"
  | "inspecting"
  | "interrogating"
  | "analyzing"
  | "reviewing"
  | "paused"
  | "completed"
  | "failed"
  | "abandoned";

export interface InvestigationContext {
  readonly id: string;
  readonly caseId: string;
  readonly playerId: string;

  lifecycleState: InvestigationLifecycleState;
  lifecycleHistory: LifecycleSnapshot[];

  currentLocationId: string | null;
  visitedLocationIds: Set<string>;
  selectedNpcId: string | null;
  selectedEvidenceId: string | null;
  selectedObservationId: string | null;

  discoveries: InvestigationDiscoveries;
  objectives: InvestigationObjectiveState[];
  activeSystems: Set<string>;

  activityHistory: ActivityEntry[];
  notificationQueue: InvestigationNotification[];
  investigationLog: LogEntry[];

  progress: InvestigationProgress;
  runtimeVariables: Map<string, unknown>;
  temporaryCache: Map<string, unknown>;

  sessionTimers: Map<string, TimerState>;
  recentActions: string[];

  isPaused: boolean;
  isComplete: boolean;
  isFailed: boolean;
  isAbandoned: boolean;

  createdAt: DomainTimestamp;
  updatedAt: DomainTimestamp;
  startedAt: DomainTimestamp | null;
  completedAt: DomainTimestamp | null;
}

export interface LifecycleSnapshot {
  readonly state: InvestigationLifecycleState;
  readonly timestamp: DomainTimestamp;
  readonly metadata?: Record<string, unknown>;
}

export interface InvestigationDiscoveries {
  discoveredObjects: Set<string>;
  discoveredEvidence: Set<string>;
  discoveredObservations: Set<string>;
  discoveredStatements: Set<string>;
  discoveredTimelineEvents: Set<string>;
  discoveredTheoryNodes: Set<string>;
  discoveredNpcProfiles: Set<string>;
  discoveredLocations: Set<string>;
  hiddenDiscoveries: string[];
  unknownDiscoveries: string[];
}

export interface InvestigationObjectiveState {
  readonly objectiveId: string;
  readonly objective: Objective;
  isActive: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  isRevealed: boolean;
  progress: number;
  attempts: number;
  activatedAt: DomainTimestamp | null;
  completedAt: DomainTimestamp | null;
  failedAt: DomainTimestamp | null;
  dependencies: string[];
}

export interface ActivityEntry {
  readonly id: string;
  readonly timestamp: DomainTimestamp;
  readonly actionType: string;
  readonly source: string;
  readonly targetId: string | null;
  readonly locationId: string | null;
  readonly metadata: Record<string, unknown>;
  readonly isUndoable: boolean;
}

export interface InvestigationNotification {
  readonly id: string;
  readonly type: NotificationCategory;
  readonly priority: number;
  readonly title: string;
  readonly message: string;
  readonly timestamp: DomainTimestamp;
  readonly isRead: boolean;
  readonly actionUrl: string | null;
  readonly metadata: Record<string, unknown>;
  readonly expiresAt: DomainTimestamp | null;
}

export type NotificationCategory =
  | "objective_update"
  | "unlock"
  | "error"
  | "warning"
  | "hint"
  | "discovery"
  | "achievement"
  | "progress"
  | "system"
  | "dialogue";

export interface LogEntry {
  readonly id: string;
  readonly timestamp: DomainTimestamp;
  readonly category: LogCategory;
  readonly message: string;
  readonly importance: "low" | "medium" | "high" | "critical";
  readonly relatedEntityId: string | null;
  readonly metadata: Record<string, unknown>;
}

export type LogCategory =
  | "discovery"
  | "objective"
  | "unlock"
  | "dialogue"
  | "timeline"
  | "action"
  | "event"
  | "system"
  | "error";

export interface InvestigationProgress {
  overall: number;
  objectives: number;
  discoveries: number;
  evidence: number;
  observations: number;
  dialogue: number;
  timeline: number;
  theory: number;
  byCategory: Record<string, { completed: number; total: number; percentage: number }>;
  estimatedTimeRemaining: number | null;
  lastCalculated: DomainTimestamp;
}

export interface TimerState {
  readonly id: string;
  readonly startedAt: DomainTimestamp;
  pausedAt: DomainTimestamp | null;
  elapsedSeconds: number;
  isPaused: boolean;
  isExpired: boolean;
}

export interface DiscoveryEntry {
  readonly id: string;
  readonly type: DiscoveryType;
  readonly name: string;
  readonly description: string;
  readonly locationId: string | null;
  readonly discoveredAt: DomainTimestamp;
  readonly isHidden: boolean;
  readonly isKey: boolean;
  readonly tags: string[];
  readonly metadata: Record<string, unknown>;
}

export type DiscoveryType =
  | "object"
  | "evidence"
  | "observation"
  | "statement"
  | "timeline_event"
  | "theory_node"
  | "npc_profile"
  | "location"
  | "hidden"
  | "unknown";

export interface InvestigatablePlugin {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly supportedActions: string[];
  initialize(context: InvestigationContext): Promise<void>;
  shutdown(): Promise<void>;
  onStateChange?(state: InvestigationLifecycleState): void;
  getAvailableActions?(): string[];
}

export interface ProgressWeightConfig {
  objectives: number;
  evidence: number;
  observations: number;
  dialogue: number;
  timeline: number;
  theory: number;
  notes: number;
}

export const DEFAULT_PROGRESS_WEIGHTS: ProgressWeightConfig = {
  objectives: 0.35,
  evidence: 0.20,
  observations: 0.15,
  dialogue: 0.10,
  timeline: 0.10,
  theory: 0.05,
  notes: 0.05,
};

export interface InvestigationFilter extends Filter {
  readonly entityType: string;
}

export interface InvestigationSortOption {
  readonly id: string;
  readonly label: string;
  readonly field: string;
  readonly direction: "asc" | "desc";
}
