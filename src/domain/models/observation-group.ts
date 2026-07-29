export interface ObservationGroup {
  readonly id: string;
  readonly caseId: string;
  readonly name: string;
  readonly description: string;
  readonly observationIds: string[];
  readonly requiredCount: number;
  readonly isComplete: boolean;
  readonly completedAt: string | null;
  readonly order: number;
  readonly tags: string[];
}

export interface ObservationRequirement {
  readonly id: string;
  readonly observationId: string;
  readonly requiredObservationId: string;
  readonly requirementType: "requires" | "enhances" | "contradicts" | "supersedes";
  readonly description: string;
  readonly isSatisfied: boolean;
}
