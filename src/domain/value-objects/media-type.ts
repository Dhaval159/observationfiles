export interface DomainMediaType {
  readonly value: string;
  readonly group: MediaGroup;
  readonly extension: string;
  readonly isImage: boolean;
  readonly isAudio: boolean;
  readonly isVideo: boolean;
  readonly isDocument: boolean;
  equals(other: DomainMediaType): boolean;
}

export type MediaGroup = "image" | "audio" | "video" | "document" | "archive" | "other";

const MEDIA_TYPE_MAP: Record<string, { group: MediaGroup; extension: string }> = {
  "image/jpeg": { group: "image", extension: "jpg" },
  "image/png": { group: "image", extension: "png" },
  "image/gif": { group: "image", extension: "gif" },
  "image/webp": { group: "image", extension: "webp" },
  "image/svg+xml": { group: "image", extension: "svg" },
  "audio/mpeg": { group: "audio", extension: "mp3" },
  "audio/wav": { group: "audio", extension: "wav" },
  "audio/ogg": { group: "audio", extension: "ogg" },
  "video/mp4": { group: "video", extension: "mp4" },
  "video/webm": { group: "video", extension: "webm" },
  "application/pdf": { group: "document", extension: "pdf" },
  "text/plain": { group: "document", extension: "txt" },
  "text/html": { group: "document", extension: "html" },
  "application/json": { group: "document", extension: "json" },
  "application/zip": { group: "archive", extension: "zip" },
};

export function createMediaType(mimeType: string): DomainMediaType {
  const info = MEDIA_TYPE_MAP[mimeType] ?? { group: "other" as MediaGroup, extension: "bin" };
  return {
    value: mimeType,
    group: info.group,
    extension: info.extension,
    get isImage(): boolean {
      return info.group === "image";
    },
    get isAudio(): boolean {
      return info.group === "audio";
    },
    get isVideo(): boolean {
      return info.group === "video";
    },
    get isDocument(): boolean {
      return info.group === "document";
    },
    equals(other: DomainMediaType): boolean {
      return this.value === other.value;
    },
  };
}
