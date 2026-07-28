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

export type EvidenceType = "physical" | "digital" | "testimony" | "document" | "photograph";
export type EvidenceCategory = "weapon" | "motive" | "opportunity" | "alibi" | "timeline" | "forensic";
