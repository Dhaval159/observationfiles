export interface NPC {
  id: string;
  caseId: string;
  name: string;
  role: NPCRole;
  description: string;
  portraitUrl: string | null;
  location: string;
  relationship: RelationshipStatus;
  trustLevel: number;
}

export type NPCRole = "witness" | "suspect" | "victim" | "informant" | "expert" | "bystander";
export type RelationshipStatus = "neutral" | "friendly" | "hostile" | "cooperative" | "deceptive";
