import type { ICaseEngine } from "../i-case-engine";
import type { CaseEngineConfig } from "./types";
import type { FullCase, CaseDefinition, CaseDifficulty } from "@/types/case";
import type { CaseProgress } from "@/domain/repositories/progress-repository";
import type { Result } from "@/domain/results/result";
import type { EventBus } from "@/domain/events/base-event";
import type { Objective } from "@/domain/models/objective";
import type { ObjectiveState } from "./types";
import type { UnlockResult } from "./types";
import type { CaseValidationResult } from "./types";
import type { DependencyGraph } from "./types";
import type { CaseContext } from "./types";
import { success, failure } from "@/domain/results/result";
import { InvalidProgressError, EngineError } from "@/domain/errors/domain-error";
import { CaseLifecycle } from "./lifecycle/case-lifecycle";
import { CompositeCaseLoader } from "./loader/composite-case-loader";
import { InMemoryCaseRegistry } from "./registry/case-registry";
import { CaseManager } from "./manager/case-manager";
import { CaseValidator } from "./validation/case-validator";
import { UnlockManager } from "./unlock/unlock-manager";
import { ObjectiveManager } from "./objectives/objective-manager";
import { InMemoryCasePersistence } from "./persistence/case-persistence";
import { FlagSystem } from "./flags/flag-system";
import { VariableSystem } from "./flags/variable-system";
import { createDependencyGraph, buildGraphFromCaseDefinition } from "./graph/dependency-graph";
import { now } from "@/domain/value-objects/timestamp";

export class CaseEngine implements ICaseEngine {
  readonly id: string;
  readonly name: string;

  private readonly _lifecycle: CaseLifecycle;
  private readonly _loader: CompositeCaseLoader;
  private readonly _registry: InMemoryCaseRegistry;
  private readonly _validator: CaseValidator;
  private readonly _unlockManager: UnlockManager;
  private readonly _objectiveManager: ObjectiveManager;
  private readonly _flagSystem: FlagSystem;
  private readonly _variableSystem: VariableSystem;
  private readonly _persistence: InMemoryCasePersistence;
  private readonly _manager: CaseManager;
  private readonly _config: CaseEngineConfig;

  private _eventBus: EventBus | null = null;

  constructor(config?: Partial<CaseEngineConfig>) {
    this.id = "case-engine";
    this.name = "Case Engine";

    this._config = {
      enableAutoSave: true,
      autoSaveIntervalSeconds: 300,
      maxSessionDurationMinutes: null,
      validateOnLoad: true,
      strictValidation: true,
      enableDependencyGraph: true,
      enableFlags: true,
      enableVariables: true,
      enableEventSystem: true,
      enablePersistence: true,
      ...config,
    };

    this._lifecycle = new CaseLifecycle();
    this._registry = new InMemoryCaseRegistry();
    this._loader = new CompositeCaseLoader();
    this._validator = new CaseValidator();
    this._unlockManager = new UnlockManager();
    this._objectiveManager = new ObjectiveManager();
    this._flagSystem = new FlagSystem();
    this._variableSystem = new VariableSystem();
    this._persistence = new InMemoryCasePersistence();

    this._manager = new CaseManager(
      this._lifecycle,
      this._loader,
      this._registry,
      this._persistence,
      this._config,
    );
  }

  get config(): Readonly<CaseEngineConfig> {
    return this._config;
  }

  get registry(): InMemoryCaseRegistry {
    return this._registry;
  }

  get loader(): CompositeCaseLoader {
    return this._loader;
  }

  get persistence(): InMemoryCasePersistence {
    return this._persistence;
  }

  get validator(): CaseValidator {
    return this._validator;
  }

  get unlockManager(): UnlockManager {
    return this._unlockManager;
  }

  get objectiveManager(): ObjectiveManager {
    return this._objectiveManager;
  }

  get flagSystem(): FlagSystem {
    return this._flagSystem;
  }

  get variableSystem(): VariableSystem {
    return this._variableSystem;
  }

  setEventBus(eventBus: EventBus): void {
    this._eventBus = eventBus;
    this._manager.setEventBus(eventBus);
  }

  getEventBus(): EventBus | null {
    return this._eventBus;
  }

  registerCase(definition: CaseDefinition): Result<void> {
    const validation = this._validator.validateDefinition(definition);
    if (!validation.isValid && this._config.strictValidation) {
      return failure(
        new InvalidProgressError(
          `Case validation failed: ${validation.errors.map((e) => e.message).join("; ")}`,
        ),
      );
    }

    return this._registry.register(definition);
  }

  registerCases(definitions: CaseDefinition[]): Result<number> {
    let registered = 0;
    for (const def of definitions) {
      const result = this.registerCase(def);
      if (result.success) registered++;
    }
    return success(registered);
  }

  validateCase(caseId: string): Result<CaseValidationResult> {
    const defResult = this._registry.get(caseId);
    if (!defResult.success) {
      return failure(defResult.error);
    }
    return success(this._validator.validateDefinition(defResult.data));
  }

  async loadCase(
    caseId: string,
    playerId: string,
    _difficulty?: CaseDifficulty,
  ): Promise<Result<FullCase>> {
    const ctxResult = await this._manager.openCase(caseId, playerId);
    if (!ctxResult.success) return failure(ctxResult.error);

    const context = ctxResult.data;

    if (context.caseDefinition && this._config.enableDependencyGraph) {
      const graph = createDependencyGraph();
      buildGraphFromCaseDefinition(graph, context.caseDefinition);
      context.dependencyGraph = graph;
    }

    if (this._config.enableFlags) {
      this._flagSystem.initialize(context);
    }

    if (this._config.enableVariables) {
      this._variableSystem.initialize(context);
    }

    if (context.activeCase) {
      return success(context.activeCase);
    }

    const fullResult = await this._loader.loadFullCase(caseId, playerId);
    if (fullResult.success) {
      context.activeCase = fullResult.data;
      return fullResult;
    }

    return failure(new EngineError(this.id, `No FullCase data available for '${caseId}'`));
  }

  async startCase(caseId: string, playerId: string): Promise<Result<FullCase>> {
    const ctxResult = await this._manager.startCase(caseId, playerId);
    if (!ctxResult.success) return failure(ctxResult.error);

    if (this._config.enableAutoSave && this._config.enablePersistence) {
      await this._persistence.autoSave(ctxResult.data);
    }

    return success(ctxResult.data.activeCase!);
  }

  async getAvailableCases(playerId: string): Promise<Result<FullCase[]>> {
    const listResult = await this._registry.list();
    if (!listResult.success) return failure(listResult.error);

    const cases: FullCase[] = [];
    for (const def of listResult.data) {
      const lockResult = await this.isCaseUnlocked(def.id, playerId);
      if (lockResult.success && lockResult.data) {
        const fullResult = await this._loader.loadFullCase(def.id, playerId);
        if (fullResult.success) {
          cases.push(fullResult.data);
        }
      }
    }

    return success(cases);
  }

  async getCaseDefinition(caseId: string): Promise<Result<CaseDefinition>> {
    return this._registry.get(caseId);
  }

  async getAllDefinitions(): Promise<Result<CaseDefinition[]>> {
    return this._registry.list();
  }

  async completeCase(caseId: string, playerId: string): Promise<Result<CaseProgress>> {
    const ctxResult = await this._manager.completeCase(playerId);
    if (!ctxResult.success) return failure(ctxResult.error);

    const context = ctxResult.data;

    const progress: CaseProgress = {
      id: `${playerId}_${caseId}`,
      playerId,
      caseId,
      status: "completed",
      score: context.progress?.score ?? 0,
      maxScore: context.progress?.maxScore ?? 0,
      timeSpentSeconds: context.session.playTimeSeconds,
      evidenceFound: context.session.discoveredEvidenceIds.size,
      totalEvidence: context.progress?.totalEvidence ?? 0,
      observationsMade: context.session.discoveredObservationIds.size,
      totalObservations: context.progress?.totalObservations ?? 0,
      hintsUsed: context.progress?.hintsUsed ?? 0,
      contradictionsFound: context.progress?.contradictionsFound ?? 0,
      startedAt: context.session.startedAt.toISOString(),
      completedAt: now().toISOString(),
      lastSavedAt: now().toISOString(),
    };

    context.progress = progress;

    if (this._config.enablePersistence) {
      await this._persistence.autoSave(context);
    }

    return success(progress);
  }

  async failCase(caseId: string, playerId: string, reason: string): Promise<Result<CaseProgress>> {
    const ctxResult = await this._manager.failCase(playerId, reason);
    if (!ctxResult.success) {
      return failure(ctxResult.error);
    }

    const context = ctxResult.data;

    const progress: CaseProgress = {
      id: `${playerId}_${caseId}`,
      playerId,
      caseId,
      status: "failed",
      score: context.progress?.score ?? 0,
      maxScore: context.progress?.maxScore ?? 0,
      timeSpentSeconds: context.session.playTimeSeconds,
      evidenceFound: context.session.discoveredEvidenceIds.size,
      totalEvidence: context.progress?.totalEvidence ?? 0,
      observationsMade: context.session.discoveredObservationIds.size,
      totalObservations: context.progress?.totalObservations ?? 0,
      hintsUsed: context.progress?.hintsUsed ?? 0,
      contradictionsFound: context.progress?.contradictionsFound ?? 0,
      startedAt: context.session.startedAt.toISOString(),
      completedAt: now().toISOString(),
      lastSavedAt: now().toISOString(),
    };

    return success(progress);
  }

  async resetCase(caseId: string, playerId: string): Promise<Result<FullCase>> {
    const ctxResult = await this._manager.resetCase(playerId);
    if (!ctxResult.success) return failure(ctxResult.error);

    return success(ctxResult.data.activeCase!);
  }

  async getCaseProgress(caseId: string, playerId: string): Promise<Result<CaseProgress>> {
    const ctxResult = this._manager.getContext(playerId);
    if (!ctxResult.success) {
      return failure(ctxResult.error);
    }

    const context = ctxResult.data;

    if (context.progress) {
      return success(context.progress);
    }

    const progress: CaseProgress = {
      id: `${playerId}_${caseId}`,
      playerId,
      caseId,
      status: (context.lifecycleState === "completed"
        ? "completed"
        : context.lifecycleState === "failed"
          ? "failed"
          : this._lifecycle.isActive()
            ? "in-progress"
            : "available") as CaseProgress["status"],
      score: 0,
      maxScore: 0,
      timeSpentSeconds: context.session.playTimeSeconds,
      evidenceFound: context.session.discoveredEvidenceIds.size,
      totalEvidence: 0,
      observationsMade: context.session.discoveredObservationIds.size,
      totalObservations: 0,
      hintsUsed: 0,
      contradictionsFound: 0,
      startedAt: context.session.startedAt.toISOString(),
      completedAt: null,
      lastSavedAt: null,
    };

    return success(progress);
  }

  async isCaseUnlocked(caseId: string, _playerId: string): Promise<Result<boolean>> {
    const defResult = this._registry.get(caseId);
    if (!defResult.success) return failure(defResult.error);

    const definition = defResult.data;

    if (!definition.unlockCondition || definition.unlockCondition.type === "custom") {
      return success(true);
    }

    return success(true);
  }

  async getUnlockRequirements(caseId: string): Promise<Result<unknown[]>> {
    const defResult = this._registry.get(caseId);
    if (!defResult.success) return failure(defResult.error);

    const requirements: unknown[] = [];
    if (defResult.data.unlockCondition) {
      requirements.push(defResult.data.unlockCondition);
    }

    return success(requirements);
  }

  async getCaseStatistics(
    caseId: string,
    playerId: string,
  ): Promise<Result<Record<string, number>>> {
    const ctxResult = this._manager.getContext(playerId);
    if (!ctxResult.success) {
      return success({
        totalCases: this._registry.count(),
        playTimeSeconds: 0,
        evidenceFound: 0,
        observationsMade: 0,
        completedObjectives: 0,
        activeObjectives: 0,
        unlockedContent: 0,
      });
    }

    const context = ctxResult.data;

    return success({
      totalCases: this._registry.count(),
      playTimeSeconds: context.session.playTimeSeconds,
      evidenceFound: context.session.discoveredEvidenceIds.size,
      observationsMade: context.session.discoveredObservationIds.size,
      completedObjectives: context.session.completedObjectiveIds.size,
      activeObjectives: context.session.activeObjectiveIds.size,
      unlockedContent: context.session.unlockedContentIds.size,
      flagCount: this._config.enableFlags ? this._flagSystem.count() : 0,
      variableCount: this._config.enableVariables ? this._variableSystem.count() : 0,
    });
  }

  async pauseCase(playerId: string): Promise<Result<void>> {
    const result = this._manager.pauseCase(playerId);
    if (!result.success) return failure(result.error);
    return success(undefined);
  }

  async resumeCase(playerId: string): Promise<Result<void>> {
    const result = this._manager.resumeCase(playerId);
    if (!result.success) return failure(result.error);
    return success(undefined);
  }

  async restartCase(playerId: string): Promise<Result<FullCase>> {
    const ctxResult = this._manager.getContext(playerId);
    if (!ctxResult.success) return failure(ctxResult.error);

    const caseId = ctxResult.data.session.caseId;
    return this.resetCase(caseId, playerId);
  }

  async closeCase(playerId: string): Promise<Result<void>> {
    return this._manager.closeCase(playerId);
  }

  async save(playerId: string): Promise<Result<CaseContext>> {
    const ctxResult = this._manager.getContext(playerId);
    if (!ctxResult.success) return failure(ctxResult.error);

    return this._persistence.save(ctxResult.data);
  }

  async restore(playerId: string, caseId: string): Promise<Result<CaseContext>> {
    return this._persistence.restore(playerId, caseId);
  }

  validate(caseId: string): Result<CaseValidationResult> {
    return this.validateCase(caseId);
  }

  getCurrentCase(playerId: string): Result<FullCase | null> {
    const ctxResult = this._manager.getContext(playerId);
    if (!ctxResult.success) return success(null);
    return success(ctxResult.data.activeCase);
  }

  getProgress(playerId: string): Result<CaseProgress | null> {
    const ctxResult = this._manager.getContext(playerId);
    if (!ctxResult.success) return success(null);
    return success(ctxResult.data.progress);
  }

  getObjectives(playerId: string): Result<Objective[]> {
    const ctxResult = this._manager.getContext(playerId);
    if (!ctxResult.success) return success([]);
    return success(ctxResult.data.objectives);
  }

  getObjectiveStates(playerId: string): Result<ObjectiveState[]> {
    const ctxResult = this._manager.getContext(playerId);
    if (!ctxResult.success) return success([]);
    return success(this._objectiveManager.getAllObjectiveStates(ctxResult.data));
  }

  completeObjective(playerId: string, objectiveId: string): Result<Objective> {
    const ctxResult = this._manager.getContext(playerId);
    if (!ctxResult.success) return failure(ctxResult.error);

    return this._objectiveManager.completeObjective(ctxResult.data, objectiveId);
  }

  isUnlocked(requirementId: string, playerId: string): boolean {
    const ctxResult = this._manager.getContext(playerId);
    if (!ctxResult.success) return false;

    return ctxResult.data.unlockStates.get(requirementId) ?? false;
  }

  getUnlockState(requirementId: string, playerId: string): Result<UnlockResult> {
    const ctxResult = this._manager.getContext(playerId);
    if (!ctxResult.success) return failure(ctxResult.error);

    return success({
      isUnlocked: ctxResult.data.unlockStates.get(requirementId) ?? false,
      satisfiedRequirements: [],
      unsatisfiedRequirements: [],
      overallProgress: ctxResult.data.unlockStates.get(requirementId) ? 1 : 0,
      evaluatedAt: now(),
    });
  }

  setFlag(playerId: string, flag: string, value: unknown, source?: string): Result<void> {
    const ctxResult = this._manager.getContext(playerId);
    if (!ctxResult.success) return failure(ctxResult.error);

    this._flagSystem.initialize(ctxResult.data);
    this._flagSystem.set(flag, value as string | boolean | number | null, source);
    return success(undefined);
  }

  getFlag(playerId: string, flag: string): Result<unknown> {
    const ctxResult = this._manager.getContext(playerId);
    if (!ctxResult.success) return failure(ctxResult.error);

    this._flagSystem.initialize(ctxResult.data);
    return success(this._flagSystem.get(flag));
  }

  setVariable(playerId: string, key: string, value: unknown, source?: string): Result<void> {
    const ctxResult = this._manager.getContext(playerId);
    if (!ctxResult.success) return failure(ctxResult.error);

    this._variableSystem.initialize(ctxResult.data);
    this._variableSystem.set(key, value as string | number | boolean | null, source);
    return success(undefined);
  }

  getVariable(playerId: string, key: string): Result<unknown> {
    const ctxResult = this._manager.getContext(playerId);
    if (!ctxResult.success) return failure(ctxResult.error);

    this._variableSystem.initialize(ctxResult.data);
    return success(this._variableSystem.get(key));
  }

  getLifecycleState(playerId: string): Result<string> {
    return this._manager.getCurrentState(playerId);
  }

  isCaseActive(playerId: string): boolean {
    return this._manager.isCaseActive(playerId);
  }

  getDependencyGraph(playerId: string): Result<DependencyGraph | null> {
    const ctxResult = this._manager.getContext(playerId);
    if (!ctxResult.success) return failure(ctxResult.error);
    return success(ctxResult.data.dependencyGraph);
  }

  getConfig(): Readonly<CaseEngineConfig> {
    return this._config;
  }
}
