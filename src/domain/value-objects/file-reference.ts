export interface FileReference {
  readonly path: string;
  readonly fileName: string;
  readonly extension: string;
  readonly size: number;
  readonly hashCode: string | null;
  readonly lastModified: string | null;
  readonly isValid: boolean;
  equals(other: FileReference): boolean;
}

export function createFileReference(
  path: string,
  options?: {
    size?: number;
    hashCode?: string | null;
    lastModified?: string | null;
  },
): FileReference {
  const parts = path.split("/");
  const fileName = parts[parts.length - 1] ?? "";
  const extParts = fileName.split(".");
  const extension = extParts.length > 1 ? (extParts[extParts.length - 1] ?? "") : "";

  return {
    path,
    fileName,
    extension: extension.toLowerCase(),
    size: options?.size ?? 0,
    hashCode: options?.hashCode ?? null,
    lastModified: options?.lastModified ?? null,
    get isValid(): boolean {
      return fileName.length > 0 && path.length > 0;
    },
    equals(other: FileReference): boolean {
      return this.path === other.path && this.size === other.size && this.hashCode === other.hashCode;
    },
  };
}
