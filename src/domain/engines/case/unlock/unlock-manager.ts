import type { UnlockResult } from "../types";
import type { Requirement, RequirementSet } from "@/domain/models/unlock-condition";
import type { CaseContext } from "../types";
import { now } from "@/domain/value-objects/timestamp";
import { evaluateRequirement, evaluateRequirementSet, type EvaluationContext } from "@/domain/utils/requirement-evaluator";

export class UnlockManager {
  evaluate(
    requirements: Requirement[],
    context: CaseContext,
  ): UnlockResult {
    const evalCtx = this._buildEvaluationContext(context);
    const satisfied: Requirement[] = [];
    const unsatisfied: Requirement[] = [];

    for (const req of requirements) {
      if (evaluateRequirement(req, evalCtx)) {
        satisfied.push(req);
      } else {
        unsatisfied.push(req);
      }
    }

    const overallProgress = requirements.length > 0
      ? satisfied.length / requirements.length
      : 1;

    return {
      isUnlocked: unsatisfied.length === 0,
      satisfiedRequirements: satisfied,
      unsatisfiedRequirements: unsatisfied,
      overallProgress,
      evaluatedAt: now(),
    };
  }

  evaluateSet(
    set: RequirementSet,
    context: CaseContext,
  ): UnlockResult {
    const evalCtx = this._buildEvaluationContext(context);
    const result = evaluateRequirementSet(set, evalCtx);

    const satisfied: Requirement[] = [];
    const unsatisfied: Requirement[] = [];

    for (const req of set.requirements) {
      if (evaluateRequirement(req, evalCtx)) {
        satisfied.push(req);
      } else {
        unsatisfied.push(req);
      }
    }

    return {
      isUnlocked: result.isSatisfied,
      satisfiedRequirements: satisfied,
      unsatisfiedRequirements: unsatisfied,
      overallProgress: set.requirements.length > 0
        ? result.satisfiedCount / set.requirements.length
        : 1,
      evaluatedAt: now(),
    };
  }

  isUnlocked(
    requirements: Requirement[],
    context: CaseContext,
  ): boolean {
    return this.evaluate(requirements, context).isUnlocked;
  }

  getUnlockProgress(
    requirements: Requirement[],
    context: CaseContext,
  ): { current: number; total: number; percentage: number } {
    const evalCtx = this._buildEvaluationContext(context);
    let satisfied = 0;
    for (const req of requirements) {
      if (evaluateRequirement(req, evalCtx)) satisfied++;
    }
    const total = requirements.length;
    return {
      current: satisfied,
      total,
      percentage: total > 0 ? (satisfied / total) * 100 : 100,
    };
  }

  private _buildEvaluationContext(context: CaseContext): EvaluationContext {
    return {
      completedCases: context.progress ? [context.progress.caseId] : [],
      collectedEvidence: [...context.session.discoveredEvidenceIds],
      observationsMade: [...context.session.discoveredObservationIds],
      unlockedAchievements: [],
      totalScore: context.progress?.score ?? 0,
      playerLevel: 1,
      visitedLocations: [...context.session.visitedLocationIds],
      completedObjectives: [...context.session.completedObjectiveIds],
      activeObjectives: [...context.session.activeObjectiveIds],
      unlockedContentIds: [...context.session.unlockedContentIds],
      flags: Object.fromEntries(context.flags),
      variables: Object.fromEntries(context.variables),
    };
  }
}
