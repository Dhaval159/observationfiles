export interface UnlockCondition {
  readonly id: string;
  readonly type: string;
  readonly config: Record<string, unknown>;
  readonly description: string;
  readonly isSatisfied: boolean;
  readonly satisfiedAt: string | null;
}

export interface Requirement {
  readonly id: string;
  readonly type: string;
  readonly targetId: string;
  readonly operator: string;
  readonly value: unknown;
  readonly description: string;
  readonly isOptional: boolean;
  readonly isSatisfied: boolean;
  readonly satisfiedAt: string | null;
}

export interface RequirementSet {
  readonly id: string;
  readonly name: string;
  readonly requirements: Requirement[];
  readonly combinator: "all" | "any" | "none" | "at_least";
  readonly minRequired: number;
  readonly isSatisfied: boolean;
  readonly satisfiedCount: number;
  readonly totalCount: number;
}
