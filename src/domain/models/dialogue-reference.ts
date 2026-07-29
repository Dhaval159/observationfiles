export interface DialogueReference {
  readonly id: string;
  readonly caseId: string;
  readonly npcId: string;
  readonly triggerCondition: Record<string, unknown>;
  readonly priority: number;
  readonly isRepeatable: boolean;
  readonly hasBeenTriggered: boolean;
  readonly order: number;
}

export interface Statement {
  readonly id: string;
  readonly caseId: string;
  readonly npcId: string;
  readonly text: string;
  readonly timestamp: string;
  readonly referencedEvidence: string[];
  readonly referencedObservations: string[];
  readonly referencedNpcs: string[];
  readonly confidenceLevel: number;
  readonly isVerified: boolean;
  readonly verifiedAt: string | null;
  readonly verifiedBy: string | null;
  readonly contradictions: string[];
  readonly tags: string[];
  readonly isKey: boolean;
}
