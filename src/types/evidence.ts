export interface Evidence {
  id: string;
  caseId: string;
  name: string;
  description: string;
  type: EvidenceType;
  category: EvidenceCategory;
  location: string;
  collectedAt: string | null;
  isKey: boolean;
}

export type EvidenceType =
  | "physical"
  | "digital"
  | "testimony"
  | "document"
  | "photograph"
  | "audio"
  | "video"
  | "report"
  | "receipt"
  | "object"
  | "fingerprint"
  | "footprint"
  | "dna"
  | "tool"
  | "weapon"
  | "drug"
  | "fiber"
  | "digital_file"
  | "email"
  | "phone_record"
  | "bank_statement"
  | "social_media"
  | "cctv"
  | "letter"
  | "note"
  | "photo"
  | "map"
  | "diagram"
  | "autopsy_report"
  | "lab_report";

export type EvidenceCategory =
  | "weapon"
  | "motive"
  | "opportunity"
  | "alibi"
  | "timeline"
  | "forensic"
  | "physical"
  | "digital"
  | "testimony"
  | "document"
  | "circumstantial"
  | "direct"
  | "corroborating"
  | "exculpatory"
  | "inculpatory";

export interface EvidenceMetadata {
  dimensions: string | null;
  weight: number | null;
  material: string | null;
  condition: string | null;
  manufacturer: string | null;
  serialNumber: string | null;
  timeOfCollection: string | null;
  collectedBy: string | null;
  chainOfCustody: ChainOfCustodyEntry[];
}

export interface ChainOfCustodyEntry {
  timestamp: string;
  handler: string;
  action: string;
  notes: string | null;
}

export interface EvidenceMedia {
  url: string;
  type: "image" | "audio" | "video" | "pdf" | "text";
  thumbnail: string | null;
  duration: number | null;
  format: string;
  transcription: string | null;
}

export interface EvidenceRelationship {
  sourceId: string;
  targetId: string;
  relationshipType:
    "supports" | "contradicts" | "relates_to" | "proves" | "disproves" | "duplicates" | "mentions";
}

export interface EvidenceTag {
  id: string;
  name: string;
  color: string;
}

export interface FullEvidence extends Evidence {
  unlockCondition: Record<string, unknown> | null;
  isHidden: boolean;
  discoveredAt: string | null;
  analyzedAt: string | null;
  analysisNotes: string | null;
  confidenceLevel: number;
  relatedEvidence: EvidenceRelationship[];
  tags: EvidenceTag[];
  metadata: EvidenceMetadata;
  media: EvidenceMedia[];
  inventory: boolean;
}

export interface EvidenceDefinition {
  id: string;
  caseId: string;
  name: string;
  description: string;
  type: EvidenceType;
  category: EvidenceCategory;
  location: string;
  isKey: boolean;
  unlockCondition: Record<string, unknown> | null;
  isHidden: boolean;
  tags: EvidenceTag[];
  metadata: EvidenceMetadata;
  media: EvidenceMedia[];
}
