export interface Relationship {
  readonly id: string;
  readonly caseId: string;
  readonly sourceId: string;
  readonly sourceType: RelationshipSourceType;
  readonly targetId: string;
  readonly targetType: RelationshipSourceType;
  readonly relationshipType: string;
  readonly label: string;
  readonly description: string;
  readonly confidence: number;
  readonly isBidirectional: boolean;
  readonly isDiscovered: boolean;
  readonly discoveredAt: string | null;
  readonly isKey: boolean;
  readonly tags: string[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type RelationshipSourceType = "npc" | "evidence" | "observation" | "location" | "theory_node";
