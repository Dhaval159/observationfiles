import type { TaskStatus } from "../enums";
import type { PriorityLevel } from "../value-objects/priority";

export interface Task {
  readonly id: string;
  readonly caseId: string;
  readonly objectiveId: string | null;
  readonly title: string;
  readonly description: string;
  readonly detailedDescription: string;
  readonly status: TaskStatus;
  readonly priority: PriorityLevel;
  readonly assignedNpcId: string | null;
  readonly requiredTaskIds: string[];
  readonly blockedByTaskIds: string[];
  readonly dependencyType: "all" | "any" | "none";
  readonly unlockCondition: Record<string, unknown> | null;
  readonly completionCondition: Record<string, unknown>;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
  readonly failedAt: string | null;
  readonly rewardXp: number;
  readonly rewardScore: number;
  readonly isRepeatable: boolean;
  readonly maxAttempts: number | null;
  readonly attempts: number;
  readonly hints: string[];
  readonly tags: string[];
  readonly order: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}
