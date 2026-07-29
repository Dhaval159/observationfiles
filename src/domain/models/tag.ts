export interface Tag {
  readonly id: string;
  readonly name: string;
  readonly color: string;
  readonly description: string | null;
  readonly category: string | null;
  readonly usageCount: number;
  readonly createdAt: string;
}

export interface Category {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly parentCategoryId: string | null;
  readonly childCategoryIds: string[];
  readonly color: string;
  readonly icon: string | null;
  readonly sortOrder: number;
  readonly isSystem: boolean;
  readonly createdAt: string;
}
