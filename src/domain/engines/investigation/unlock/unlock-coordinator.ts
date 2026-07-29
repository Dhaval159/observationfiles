import type { InvestigationContext } from "../types";
import type { Requirement, RequirementSet } from "@/domain/models/unlock-condition";
import type { Result } from "@/domain/results/result";
import type { EvaluationContext } from "@/domain/utils/requirement-evaluator";
import { success, failure } from "@/domain/results/result";
import { EngineError } from "@/domain/errors/domain-error";
import { now } from "@/domain/value-objects/timestamp";
import { evaluateRequirement, evaluateRequirementSet } from "@/domain/utils/requirement-evaluator";
import { touchContext } from "../context/investigation-context";

export interface UnlockableSystem {
  readonly id: string;
  readonly name: string;
  readonly requirements: Requirement[];
  readonly onUnlock: (ctx: InvestigationContext) => Promise<void>;
  isUnlocked(ctx: InvestigationContext): boolean;
}

export class UnlockCoordinator {
  private _systems: Map<string, UnlockableSystem> = new Map();
  private _unlockHistory: Array<{
    systemId: string;
    unlockedAt: string;
    requirements: Requirement[];
  }> = [];

  registerSystem(system: UnlockableSystem): Result<void> {
    if (this._systems.has(system.id)) {
      return failure(
        new EngineError("UnlockCoordinator", `Unlockable system '${system.id}' is already registered`),
      );
    }
    this._systems.set(system.id, system);
    return success(undefined);
  }

  unregisterSystem(systemId: string): void {
    this._systems.delete(systemId);
  }

  getSystem(systemId: string): UnlockableSystem | undefined {
    return this._systems.get(systemId);
  }

  listSystems(): UnlockableSystem[] {
    return [...this._systems.values()];
  }

  evaluateSystem(ctx: InvestigationContext, systemId: string): boolean {
    const system = this._systems.get(systemId);
    if (!system) return false;

    if (system.isUnlocked(ctx)) return true;

    const evalCtx = this._buildContext(ctx);
    return system.requirements.every((req) =>
      evaluateRequirement(req, evalCtx),
    );
  }

  async unlockSystem(
    ctx: InvestigationContext,
    systemId: string,
  ): Promise<Result<UnlockableSystem>> {
    const system = this._systems.get(systemId);
    if (!system) {
      return failure(new EngineError("UnlockCoordinator", `Unlockable system '${systemId}' not found`));
    }

    if (system.isUnlocked(ctx)) {
      return success(system);
    }

    const evalCtx = this._buildContext(ctx);
    const allMet = system.requirements.every((req) =>
      evaluateRequirement(req, evalCtx),
    );

    if (!allMet) {
      return failure(
        new EngineError("UnlockCoordinator", `Requirements not met for system '${systemId}'`),
      );
    }

    await system.onUnlock(ctx);
    ctx.activeSystems.add(systemId);
    touchContext(ctx);

    this._unlockHistory.push({
      systemId,
      unlockedAt: now().toISOString(),
      requirements: system.requirements,
    });

    return success(system);
  }

  evaluateRequirements(
    ctx: InvestigationContext,
    requirements: Requirement[],
  ): { isUnlocked: boolean; satisfiedCount: number; totalCount: number } {
    const evalCtx = this._buildContext(ctx);
    let satisfied = 0;

    for (const req of requirements) {
      if (evaluateRequirement(req, evalCtx)) satisfied++;
    }

    return {
      isUnlocked: satisfied === requirements.length,
      satisfiedCount: satisfied,
      totalCount: requirements.length,
    };
  }

  getUnlockHistory(): ReadonlyArray<{
    systemId: string;
    unlockedAt: string;
    requirements: Requirement[];
  }> {
    return this._unlockHistory;
  }

  getLockedSystems(ctx: InvestigationContext): UnlockableSystem[] {
    return [...this._systems.values()].filter((s) => !s.isUnlocked(ctx));
  }

  getUnlockedSystems(ctx: InvestigationContext): UnlockableSystem[] {
    return [...this._systems.values()].filter((s) => s.isUnlocked(ctx));
  }

  private _buildContext(ctx: InvestigationContext): EvaluationContext {
    return {
      completedObjectives: [...ctx.objectives.filter((o) => o.isCompleted).map((o) => o.objectiveId)],
      collectedEvidence: [...ctx.discoveries.discoveredEvidence],
      observationsMade: [...ctx.discoveries.discoveredObservations],
      visitedLocations: [...ctx.visitedLocationIds],
      completedCases: ctx.isComplete ? [ctx.caseId] : [],
      totalScore: 0,
      playerLevel: 1,
      unlockedAchievements: [],
      activeObjectives: [...ctx.objectives.filter((o) => o.isActive).map((o) => o.objectiveId)],
      unlockedContentIds: [...ctx.activeSystems],
      flags: Object.fromEntries(ctx.runtimeVariables),
      variables: Object.fromEntries(ctx.runtimeVariables),
    };
  }
}
