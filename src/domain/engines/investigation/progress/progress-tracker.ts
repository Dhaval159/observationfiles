import type { InvestigationContext, ProgressWeightConfig } from "../types";
import { DEFAULT_PROGRESS_WEIGHTS } from "../types";
import { now } from "@/domain/value-objects/timestamp";
import { touchContext } from "../context/investigation-context";

export class ProgressTracker {
  private _weightConfig: ProgressWeightConfig;

  constructor(weightConfig?: Partial<ProgressWeightConfig>) {
    this._weightConfig = { ...DEFAULT_PROGRESS_WEIGHTS, ...weightConfig };
  }

  get weightConfig(): Readonly<ProgressWeightConfig> {
    return this._weightConfig;
  }

  updateWeights(weights: Partial<ProgressWeightConfig>): void {
    this._weightConfig = { ...this._weightConfig, ...weights };
  }

  calculate(ctx: InvestigationContext): void {
    const completedObjectives = ctx.objectives.filter((o) => o.isCompleted).length;
    const totalObjectives = ctx.objectives.length;

    const evidenceDiscovered = ctx.discoveries.discoveredEvidence.size;
    const observationsMade = ctx.discoveries.discoveredObservations.size;

    const objectivesPct = totalObjectives > 0 ? completedObjectives / totalObjectives : 0;
    const evidencePct = totalObjectives > 0 ? Math.min(1, evidenceDiscovered / Math.max(1, totalObjectives * 3)) : 0;
    const observationsPct = totalObjectives > 0 ? Math.min(1, observationsMade / Math.max(1, totalObjectives * 3)) : 0;
    const dialoguePct = ctx.discoveries.discoveredStatements.size > 0 ? 0.5 : 0;
    const timelinePct = ctx.discoveries.discoveredTimelineEvents.size > 0 ? 0.5 : 0;
    const theoryPct = ctx.discoveries.discoveredTheoryNodes.size > 0 ? 0.5 : 0;

    const overall =
      objectivesPct * this._weightConfig.objectives +
      evidencePct * this._weightConfig.evidence +
      observationsPct * this._weightConfig.observations +
      dialoguePct * this._weightConfig.dialogue +
      timelinePct * this._weightConfig.timeline +
      theoryPct * this._weightConfig.theory;

    ctx.progress = {
      overall: Math.round(overall * 100),
      objectives: Math.round(objectivesPct * 100),
      discoveries: Math.round((evidencePct + observationsPct) / 2 * 100),
      evidence: Math.round(evidencePct * 100),
      observations: Math.round(observationsPct * 100),
      dialogue: Math.round(dialoguePct * 100),
      timeline: Math.round(timelinePct * 100),
      theory: Math.round(theoryPct * 100),
      byCategory: {
        objectives: { completed: completedObjectives, total: totalObjectives, percentage: Math.round(objectivesPct * 100) },
        evidence: { completed: evidenceDiscovered, total: totalObjectives * 3, percentage: Math.round(evidencePct * 100) },
        observations: { completed: observationsMade, total: totalObjectives * 3, percentage: Math.round(observationsPct * 100) },
      },
      estimatedTimeRemaining: null,
      lastCalculated: now(),
    };

    touchContext(ctx);
  }

  getOverallProgress(ctx: InvestigationContext): number {
    return ctx.progress.overall;
  }

  getCategoryProgress(ctx: InvestigationContext, category: string): { completed: number; total: number; percentage: number } {
    return ctx.progress.byCategory[category] ?? { completed: 0, total: 0, percentage: 0 };
  }

  getAllCategories(ctx: InvestigationContext): string[] {
    return Object.keys(ctx.progress.byCategory);
  }

  isComplete(ctx: InvestigationContext): boolean {
    return ctx.progress.overall >= 100;
  }

  getRemainingPercentage(ctx: InvestigationContext): number {
    return Math.max(0, 100 - ctx.progress.overall);
  }

  calculateObjectiveProgress(
    completed: number,
    total: number,
  ): { completed: number; total: number; percentage: number } {
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }
}
