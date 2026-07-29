export interface Location {
  readonly id: string;
  readonly caseId: string;
  readonly name: string;
  readonly description: string;
  readonly detailedDescription: string;
  readonly type: LocationType;
  readonly isInitialLocation: boolean;
  readonly isVisited: boolean;
  readonly visitedAt: string | null;
  readonly ambientSoundUrl: string | null;
  readonly backgroundImageUrl: string | null;
  readonly mapPosition: { x: number; y: number } | null;
  readonly connectedLocationIds: string[];
  readonly unlockCondition: Record<string, unknown> | null;
  readonly interactableObjectIds: string[];
  readonly npcIds: string[];
  readonly availableEvidenceIds: string[];
  readonly isRestricted: boolean;
  readonly requiresEscort: boolean;
  readonly escortNpcId: string | null;
  readonly tags: string[];
  readonly order: number;
}

export type LocationType = "indoor" | "outdoor" | "crime_scene" | "office" | "residence" | "public" | "restricted" | "virtual" | "custom";

export interface LocationState {
  readonly locationId: string;
  readonly isUnlocked: boolean;
  readonly unlockedAt: string | null;
  readonly isVisited: boolean;
  readonly firstVisitedAt: string | null;
  readonly lastVisitedAt: string | null;
  readonly visitCount: number;
  readonly isCurrentlyAt: boolean;
}
