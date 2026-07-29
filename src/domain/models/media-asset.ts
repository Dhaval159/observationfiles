export interface MediaAsset {
  readonly id: string;
  readonly caseId: string;
  readonly type: MediaAssetType;
  readonly url: string;
  readonly thumbnailUrl: string | null;
  readonly title: string;
  readonly description: string | null;
  readonly mimeType: string;
  readonly format: string;
  readonly size: number;
  readonly width: number | null;
  readonly height: number | null;
  readonly duration: number | null;
  readonly transcription: string | null;
  readonly altText: string | null;
  readonly isAccessible: boolean;
  readonly accessibilityFeatures: string[];
  readonly tags: string[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type MediaAssetType = "image" | "audio" | "video" | "document" | "3d_model" | "panorama" | "diagram" | "animation";

export interface Attachment {
  readonly id: string;
  readonly parentType: AttachmentParentType;
  readonly parentId: string;
  readonly mediaAssetId: string;
  readonly relationship: "primary" | "supplementary" | "reference" | "evidence" | "attachment";
  readonly order: number;
  readonly createdAt: string;
}

export type AttachmentParentType = "evidence" | "observation" | "npc" | "location" | "case" | "timeline_event" | "theory_node" | "statement" | "dialogue";
