export interface InteractableObject {
  readonly id: string;
  readonly caseId: string;
  readonly locationId: string;
  readonly name: string;
  readonly description: string;
  readonly isInteractable: boolean;
  readonly isRepeatable: boolean;
  readonly interactionPrompt: string;
  readonly imageUrl: string | null;
  readonly modelUrl: string | null;
  readonly soundEffectUrl: string | null;
  readonly unlockCondition: Record<string, unknown> | null;
  readonly observationIds: string[];
  readonly evidenceIds: string[];
  readonly animationType: InteractableAnimationType;
  readonly interactionCount: number;
  readonly maxInteractions: number | null;
  readonly isHidden: boolean;
  readonly tags: string[];
  readonly order: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type InteractableAnimationType = "none" | "hover" | "pulse" | "glow" | "shake" | "bounce" | "fade" | "inspect" | "custom";

export interface InteractableObjectState {
  readonly objectId: string;
  readonly isInteracted: boolean;
  readonly interactionCount: number;
  readonly lastInteractionAt: string | null;
  readonly allObservationsMade: boolean;
  readonly allEvidenceCollected: boolean;
}
