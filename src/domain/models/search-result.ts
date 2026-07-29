export interface SearchResult<T = unknown> {
  readonly items: T[];
  readonly total: number;
  readonly query: string;
  readonly filters: Record<string, unknown>;
  readonly sortBy: string | null;
  readonly sortOrder: "asc" | "desc";
  readonly limit: number;
  readonly offset: number;
  readonly page: number;
  readonly totalPages: number;
  readonly hasMore: boolean;
  readonly searchTimeMs: number;
}

export interface Filter {
  readonly id: string;
  readonly field: string;
  readonly operator: string;
  readonly value: unknown;
  readonly label: string;
  readonly isActive: boolean;
}

export interface FilterGroup {
  readonly id: string;
  readonly name: string;
  readonly filters: Filter[];
  readonly combinator: "and" | "or";
}
