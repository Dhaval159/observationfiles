export interface TimelineGroup {
  readonly id: string;
  readonly caseId: string;
  readonly name: string;
  readonly description: string;
  readonly eventIds: string[];
  readonly startTime: string;
  readonly endTime: string;
  readonly type: TimelineGroupType;
  readonly confidence: number;
  readonly isComplete: boolean;
  readonly order: number;
  readonly color: string | null;
  readonly tags: string[];
}

export type TimelineGroupType = "alibi" | "crime_sequence" | "witness_account" | "investigation" | "custom";
