export interface SchemaTable {
  name: string;
  description: string;
  columns: SchemaColumn[];
  indexes: SchemaIndex[];
}

export interface SchemaColumn {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  defaultValue: string | null;
  foreignKey: {
    table: string;
    column: string;
    onDelete: string;
  } | null;
}

export interface SchemaIndex {
  name: string;
  columns: string[];
  unique: boolean;
  condition: string | null;
}

export const schemaTables: SchemaTable[] = [
  {
    name: "profiles",
    description: "User profiles extending Supabase auth.users",
    columns: [
      {
        name: "id",
        type: "uuid",
        nullable: false,
        primaryKey: true,
        defaultValue: null,
        foreignKey: { table: "auth.users", column: "id", onDelete: "CASCADE" },
      },
      {
        name: "username",
        type: "text",
        nullable: false,
        primaryKey: false,
        defaultValue: null,
        foreignKey: null,
      },
      {
        name: "display_name",
        type: "text",
        nullable: false,
        primaryKey: false,
        defaultValue: null,
        foreignKey: null,
      },
      {
        name: "avatar_url",
        type: "text",
        nullable: true,
        primaryKey: false,
        defaultValue: null,
        foreignKey: null,
      },
      {
        name: "bio",
        type: "text",
        nullable: true,
        primaryKey: false,
        defaultValue: null,
        foreignKey: null,
      },
      {
        name: "total_score",
        type: "integer",
        nullable: false,
        primaryKey: false,
        defaultValue: "0",
        foreignKey: null,
      },
      {
        name: "total_playtime_seconds",
        type: "integer",
        nullable: false,
        primaryKey: false,
        defaultValue: "0",
        foreignKey: null,
      },
      {
        name: "cases_completed",
        type: "integer",
        nullable: false,
        primaryKey: false,
        defaultValue: "0",
        foreignKey: null,
      },
      {
        name: "cases_started",
        type: "integer",
        nullable: false,
        primaryKey: false,
        defaultValue: "0",
        foreignKey: null,
      },
      {
        name: "achievements_unlocked",
        type: "integer",
        nullable: false,
        primaryKey: false,
        defaultValue: "0",
        foreignKey: null,
      },
      {
        name: "current_streak",
        type: "integer",
        nullable: false,
        primaryKey: false,
        defaultValue: "0",
        foreignKey: null,
      },
      {
        name: "longest_streak",
        type: "integer",
        nullable: false,
        primaryKey: false,
        defaultValue: "0",
        foreignKey: null,
      },
      {
        name: "preferences",
        type: "jsonb",
        nullable: false,
        primaryKey: false,
        defaultValue: "'{}'",
        foreignKey: null,
      },
      {
        name: "created_at",
        type: "timestamptz",
        nullable: false,
        primaryKey: false,
        defaultValue: "now()",
        foreignKey: null,
      },
      {
        name: "updated_at",
        type: "timestamptz",
        nullable: false,
        primaryKey: false,
        defaultValue: "now()",
        foreignKey: null,
      },
    ],
    indexes: [
      { name: "idx_profiles_username", columns: ["username"], unique: true, condition: null },
      {
        name: "idx_profiles_total_score",
        columns: ["total_score DESC"],
        unique: false,
        condition: null,
      },
    ],
  },
  {
    name: "cases",
    description: "Case definitions",
    columns: [
      {
        name: "id",
        type: "uuid",
        nullable: false,
        primaryKey: true,
        defaultValue: "uuid_generate_v4()",
        foreignKey: null,
      },
      {
        name: "title",
        type: "text",
        nullable: false,
        primaryKey: false,
        defaultValue: null,
        foreignKey: null,
      },
      {
        name: "description",
        type: "text",
        nullable: false,
        primaryKey: false,
        defaultValue: null,
        foreignKey: null,
      },
      {
        name: "difficulty",
        type: "case_difficulty",
        nullable: false,
        primaryKey: false,
        defaultValue: "'beginner'",
        foreignKey: null,
      },
      {
        name: "tags",
        type: "text[]",
        nullable: false,
        primaryKey: false,
        defaultValue: "'{}'",
        foreignKey: null,
      },
      {
        name: "unlock_condition",
        type: "jsonb",
        nullable: true,
        primaryKey: false,
        defaultValue: null,
        foreignKey: null,
      },
      {
        name: "difficulty_config",
        type: "jsonb",
        nullable: false,
        primaryKey: false,
        defaultValue: "'{}'",
        foreignKey: null,
      },
      {
        name: "is_published",
        type: "boolean",
        nullable: false,
        primaryKey: false,
        defaultValue: "false",
        foreignKey: null,
      },
      {
        name: "version",
        type: "integer",
        nullable: false,
        primaryKey: false,
        defaultValue: "1",
        foreignKey: null,
      },
      {
        name: "created_at",
        type: "timestamptz",
        nullable: false,
        primaryKey: false,
        defaultValue: "now()",
        foreignKey: null,
      },
      {
        name: "updated_at",
        type: "timestamptz",
        nullable: false,
        primaryKey: false,
        defaultValue: "now()",
        foreignKey: null,
      },
    ],
    indexes: [],
  },
];
