import type { PriorityLevel } from "../value-objects/priority";

export interface Objective {
  readonly id: string;
  readonly caseId: string;
  readonly description: string;
  readonly detailedDescription: string;
  readonly type: ObjectiveType;
  readonly priority: PriorityLevel;
  readonly isCompleted: boolean;
  readonly completedAt: string | null;
  readonly isRevealed: boolean;
  readonly revealedAt: string | null;
  readonly parentObjectiveId: string | null;
  readonly childObjectiveIds: string[];
  readonly requiredObjectiveIds: string[];
  readonly completionCondition: Record<string, unknown>;
  readonly failureCondition: Record<string, unknown> | null;
  readonly hints: string[];
  readonly rewardXp: number;
  readonly rewardScore: number;
  readonly order: number;
  readonly tags: string[];
}

export type ObjectiveType = "primary" | "secondary" | "hidden" | "optional" | "bonus" | "tutorial";
