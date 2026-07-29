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

export type NPCRole =
  | "witness"
  | "suspect"
  | "victim"
  | "informant"
  | "expert"
  | "bystander"
  | "detective"
  | "police"
  | "forensic_expert"
  | "medical_examiner"
  | "lawyer"
  | "journalist"
  | "family_member"
  | "accomplice"
  | "mastermind"
  | "red_herring";
export type RelationshipStatus = "neutral" | "friendly" | "hostile" | "cooperative" | "deceptive";

export type NPCEmotionalState =
  | "neutral"
  | "angry"
  | "sad"
  | "scared"
  | "nervous"
  | "confident"
  | "evasive"
  | "cooperative"
  | "hostile"
  | "grieving"
  | "calm"
  | "agitated"
  | "suspicious"
  | "lying";

export interface NPCStatement {
  id: string;
  npcId: string;
  text: string;
  timestamp: string;
  referencedEvidence: string[];
  referencedObservations: string[];
  truthValue: "true" | "false" | "partial" | "unknown";
  confidenceLevel: number;
}

export interface NPCRelationshipEntry {
  npcId: string;
  trustLevel: number;
  relationship: RelationshipStatus;
}

export interface NPCProfile {
  personality: string[];
  background: string;
  motive: string | null;
  alibi: string | null;
  schedule: Record<string, string>;
  secrets: string[];
  relationships: NPCRelationshipEntry[];
}

export interface NPCInterrogationState {
  emotionalState: NPCEmotionalState;
  trustLevel: number;
  pressureLevel: number;
  questionsUnlocked: string[];
  questionsAsked: string[];
  contradictionsFound: number;
  evidencePresented: string[];
}

export interface FullNPC extends NPC {
  profile: NPCProfile;
  statements: NPCStatement[];
  interrogationState: NPCInterrogationState;
}

export interface RelationshipMap {
  [npcId: string]: NPCRelationshipEntry[];
}
