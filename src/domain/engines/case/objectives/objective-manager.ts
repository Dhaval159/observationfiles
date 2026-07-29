import type { Objective } from "@/domain/models/objective";
import type { ObjectiveState } from "../types";
import type { CaseContext } from "../types";
import type { Result } from "@/domain/results/result";
import { success, failure } from "@/domain/results/result";
import { now } from "@/domain/value-objects/timestamp";
import { RequirementNotMetError, InvalidProgressError } from "@/domain/errors/domain-error";

export class ObjectiveManager {
  getObjectives(context: CaseContext): Objective[] {
    return context.objectives;
  }

  getActiveObjectives(context: CaseContext): Objective[] {
    return context.objectives.filter((o) =>
      context.session.activeObjectiveIds.has(o.id),
    );
  }

  getCompletedObjectives(context: CaseContext): Objective[] {
    return context.objectives.filter((o) =>
      context.session.completedObjectiveIds.has(o.id),
    );
  }

  getObjectiveState(context: CaseContext, objectiveId: string): ObjectiveState | null {
    const objective = context.objectives.find((o) => o.id === objectiveId);
    if (!objective) return null;

    return {
      objectiveId,
      isCompleted: context.session.completedObjectiveIds.has(objectiveId),
      isRevealed: objective.isRevealed,
      isActive: context.session.activeObjectiveIds.has(objectiveId),
      progress: 0,
      completedAt: null,
      revealedAt: null,
      startedAt: null,
      attempts: 0,
    };
  }

  getAllObjectiveStates(context: CaseContext): ObjectiveState[] {
    return context.objectives.map((o) => this.getObjectiveState(context, o.id)!)
      .filter(Boolean);
  }

  revealObjective(context: CaseContext, objectiveId: string): Result<Objective> {
    const objective = context.objectives.find((o) => o.id === objectiveId);
    if (!objective) return failure(new RequirementNotMetError("Objective", objectiveId, "exists"));

    context.session.activeObjectiveIds.add(objectiveId);

    return success(objective);
  }

  activateObjective(context: CaseContext, objectiveId: string): Result<Objective> {
    const objective = context.objectives.find((o) => o.id === objectiveId);
    if (!objective) return failure(new RequirementNotMetError("Objective", objectiveId, "exists"));

    if (!objective.isRevealed) {
      this.revealObjective(context, objectiveId);
    }

    context.session.activeObjectiveIds.add(objectiveId);

    return success(objective);
  }

  completeObjective(
    context: CaseContext,
    objectiveId: string,
    eventBus?: { publish: (event: unknown) => Promise<void> },
  ): Result<Objective> {
    const objective = context.objectives.find((o) => o.id === objectiveId);
    if (!objective) return failure(new RequirementNotMetError("Objective", objectiveId, "exists"));

    if (context.session.completedObjectiveIds.has(objectiveId)) {
      return failure(new InvalidProgressError(`Objective ${objectiveId} is already completed`));
    }

    const prerequisites = objective.requiredObjectiveIds ?? [];
    for (const prereqId of prerequisites) {
      if (!context.session.completedObjectiveIds.has(prereqId)) {
        return failure(
          new RequirementNotMetError("Objective", objectiveId, `prerequisite: ${prereqId}`),
        );
      }
    }

    context.session.completedObjectiveIds.add(objectiveId);
    context.session.activeObjectiveIds.delete(objectiveId);

    if (eventBus) {
      eventBus.publish({
        id: `OBJECTIVE_COMPLETED_${objectiveId}_${Date.now()}`,
        type: "OBJECTIVE_COMPLETED",
        source: "ObjectiveManager",
        timestamp: now(),
        caseId: context.session.caseId,
        objectiveId,
        playerId: context.playerId,
        objectiveType: objective.type,
      }).catch(() => {});
    }

    for (const childId of objective.childObjectiveIds) {
      const child = context.objectives.find((o) => o.id === childId);
      if (child && !child.isRevealed) {
        this.revealObjective(context, childId);
      }
    }

    return success(objective);
  }

  isObjectiveCompleted(context: CaseContext, objectiveId: string): boolean {
    return context.session.completedObjectiveIds.has(objectiveId);
  }

  getOverallProgress(context: CaseContext): {
    completed: number;
    total: number;
    percentage: number;
  } {
    const total = context.objectives.length;
    const completed = context.session.completedObjectiveIds.size;
    return {
      completed,
      total,
      percentage: total > 0 ? (completed / total) * 100 : 0,
    };
  }

  getRemainingObjectives(context: CaseContext): Objective[] {
    return context.objectives.filter(
      (o) => !context.session.completedObjectiveIds.has(o.id),
    );
  }

  getNextObjectives(context: CaseContext): Objective[] {
    const next: Objective[] = [];

    for (const objective of context.objectives) {
      if (context.session.completedObjectiveIds.has(objective.id)) continue;

      const prerequisites = objective.requiredObjectiveIds ?? [];
      const allPrerequisitesMet = prerequisites.every((id) =>
        context.session.completedObjectiveIds.has(id),
      );

      if (allPrerequisitesMet) {
        next.push(objective);
      }
    }

    return next;
  }

  getChildren(context: CaseContext, objectiveId: string): Objective[] {
    return context.objectives.filter((o) =>
      o.parentObjectiveId === objectiveId,
    );
  }

  getObjectiveTree(context: CaseContext): Map<string, Objective[]> {
    const tree = new Map<string, Objective[]>();

    for (const objective of context.objectives) {
      const parentId = objective.parentObjectiveId ?? "root";
      if (!tree.has(parentId)) {
        tree.set(parentId, []);
      }
      tree.get(parentId)!.push(objective);
    }

    return tree;
  }
}
