export interface DatabaseTable {
  name: string;
  schema: string;
  columns: DatabaseColumn[];
  relationships: DatabaseRelationship[];
}

export interface DatabaseColumn {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  defaultValue: unknown;
  foreignKey?: {
    table: string;
    column: string;
  };
}

export interface DatabaseRelationship {
  type: "one-to-one" | "one-to-many" | "many-to-many";
  from: string;
  to: string;
  through?: string;
}

export type DatabaseInsert<T> = Omit<T, "id" | "createdAt" | "updatedAt">;
export type DatabaseUpdate<T> = Partial<DatabaseInsert<T>>;
