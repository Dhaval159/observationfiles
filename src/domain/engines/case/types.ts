import type { FullCase, CaseDefinition, CaseDifficulty } from "@/types/case";
import type { DomainTimestamp } from "@/domain/value-objects/timestamp";
import type { Result } from "@/domain/results/result";
import type { ValidationResult } from "@/domain/models/validation-result";
import type { Objective } from "@/domain/models/objective";
import type { Requirement } from "@/domain/models/unlock-condition";
import type { CaseProgress } from "@/domain/repositories/progress-repository";

export type CaseLifecycleState =
  | "unloaded"
  | "loading"
  | "validating"
  | "initializing"
  | "ready"
  | "running"
  | "paused"
  | "completing"
  | "completed"
  | "failing"
  | "failed"
  | "resetting"
  | "unloading"
  | "error";

export interface LifecycleTransition {
  from: CaseLifecycleState;
  to: CaseLifecycleState;
  guard?: (ctx: CaseContext) => boolean;
  onEnter?: (ctx: CaseContext) => void;
  onLeave?: (ctx: CaseContext) => void;
}

export interface LifecycleEvent {
  type: CaseLifecycleState;
  previousState: CaseLifecycleState;
  timestamp: DomainTimestamp;
  metadata?: Record<string, unknown>;
}

export interface CaseSession {
  readonly id: string;
  readonly caseId: string;
  readonly playerId: string;
  currentLocationId: string | null;
  visitedLocationIds: Set<string>;
  discoveredEvidenceIds: Set<string>;
  discoveredObservationIds: Set<string>;
  completedObjectiveIds: Set<string>;
  activeObjectiveIds: Set<string>;
  unlockedContentIds: Set<string>;
  playerNotes: Record<string, string>;
  temporaryVariables: Record<string, unknown>;
  currentScreen: string | null;
  openedPanels: Set<string>;
  startedAt: DomainTimestamp;
  lastActivityAt: DomainTimestamp;
  playTimeSeconds: number;
  pauseStartTime: DomainTimestamp | null;
  totalPausedTimeSeconds: number;
}

export interface CaseContext {
  readonly id: string;
  readonly playerId: string;
  readonly session: CaseSession;
  caseDefinition: CaseDefinition | null;
  activeCase: FullCase | null;
  lifecycleState: CaseLifecycleState;
  lifecycleHistory: LifecycleEvent[];
  objectives: Objective[];
  flags: Map<string, unknown>;
  variables: Map<string, VariableValue>;
  unlockStates: Map<string, boolean>;
  dependencyGraph: DependencyGraph | null;
  progress: CaseProgress | null;
  errors: Error[];
  metadata: Map<string, unknown>;
  createdAt: DomainTimestamp;
  updatedAt: DomainTimestamp;
}

export type VariableValue =
  boolean | number | string | Date | unknown[] | Record<string, unknown> | null;

export interface DependencyGraph {
  readonly nodes: Map<string, DependencyNode>;
  readonly edges: DependencyEdge[];
  isCyclic(): boolean;
  getDependencies(nodeId: string): string[];
  getDependents(nodeId: string): string[];
  getCriticalPath(): string[];
  getTopologicalOrder(): string[];
  addNode(node: DependencyNode): void;
  addEdge(edge: DependencyEdge): void;
  removeNode(nodeId: string): void;
  validate(): { isValid: boolean; cycles: string[][] };
}

export interface DependencyNode {
  readonly id: string;
  readonly type: DependencyNodeType;
  readonly label: string;
  readonly isRequired: boolean;
  readonly isSatisfied: boolean;
  readonly metadata: Record<string, unknown>;
}

export type DependencyNodeType =
  | "case"
  | "chapter"
  | "objective"
  | "task"
  | "evidence"
  | "observation"
  | "location"
  | "npc"
  | "dialogue"
  | "timeline_event"
  | "theory_node"
  | "achievement"
  | "unlock_condition"
  | "custom";

export interface DependencyEdge {
  readonly from: string;
  readonly to: string;
  readonly type: "requires" | "unlocks" | "triggers" | "blocks" | "precedes";
  readonly weight: number;
}

export interface CaseLoader {
  readonly name: string;
  readonly priority: number;
  canLoad(caseId: string, source?: string): boolean;
  loadDefinition(caseId: string, source?: string): Promise<Result<CaseDefinition>>;
  loadFullCase(caseId: string, playerId: string, source?: string): Promise<Result<FullCase>>;
  listAvailableCases(): Promise<Result<string[]>>;
}

export interface CaseRegistry {
  register(definition: CaseDefinition): Result<void>;
  unregister(caseId: string): Result<void>;
  get(caseId: string): Result<CaseDefinition>;
  has(caseId: string): boolean;
  list(filters?: CaseRegistryFilter): Result<CaseDefinition[]>;
  search(query: string): Result<CaseDefinition[]>;
  count(): number;
  getByDifficulty(difficulty: CaseDifficulty): Result<CaseDefinition[]>;
  validateUniqueness(caseId: string): Result<boolean>;
}

export interface CaseRegistryFilter {
  difficulty?: CaseDifficulty;
  tags?: string[];
  status?: CaseLifecycleState;
  source?: string;
}

export interface CasePersistence {
  save(context: CaseContext): Promise<Result<CaseContext>>;
  restore(playerId: string, caseId: string): Promise<Result<CaseContext>>;
  autoSave(context: CaseContext): Promise<Result<CaseContext>>;
  listSaves(playerId: string): Promise<Result<string[]>>;
  deleteSave(playerId: string, caseId: string): Promise<Result<void>>;
  hasSave(playerId: string, caseId: string): Promise<Result<boolean>>;
}

export interface CaseValidationResult extends ValidationResult {
  readonly validatedSections: string[];
  readonly totalChecks: number;
  readonly passedChecks: number;
  readonly failedChecks: number;
}

export type FlagValue = boolean | number | string | null;

export interface FlagChangeEvent {
  readonly flag: string;
  readonly oldValue: FlagValue;
  readonly newValue: FlagValue;
  readonly timestamp: DomainTimestamp;
  readonly source: string;
}

export interface VariableChangeEvent {
  readonly variable: string;
  readonly oldValue: VariableValue;
  readonly newValue: VariableValue;
  readonly timestamp: DomainTimestamp;
  readonly source: string;
}

export interface ObjectiveState {
  readonly objectiveId: string;
  readonly isCompleted: boolean;
  readonly isRevealed: boolean;
  readonly isActive: boolean;
  readonly progress: number;
  readonly completedAt: DomainTimestamp | null;
  readonly revealedAt: DomainTimestamp | null;
  readonly startedAt: DomainTimestamp | null;
  readonly attempts: number;
}

export interface UnlockResult {
  readonly isUnlocked: boolean;
  readonly satisfiedRequirements: Requirement[];
  readonly unsatisfiedRequirements: Requirement[];
  readonly overallProgress: number;
  readonly evaluatedAt: DomainTimestamp;
}

export interface CaseEngineConfig {
  readonly enableAutoSave: boolean;
  readonly autoSaveIntervalSeconds: number;
  readonly maxSessionDurationMinutes: number | null;
  readonly validateOnLoad: boolean;
  readonly strictValidation: boolean;
  readonly enableDependencyGraph: boolean;
  readonly enableFlags: boolean;
  readonly enableVariables: boolean;
  readonly enableEventSystem: boolean;
  readonly enablePersistence: boolean;
}
