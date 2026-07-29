export interface DomainDifficulty {
  readonly value: DifficultyLevel;
  readonly numericValue: number;
  readonly label: string;
  isHarderThan(other: DomainDifficulty): boolean;
  isEasierThan(other: DomainDifficulty): boolean;
  equals(other: DomainDifficulty): boolean;
}

export type DifficultyLevel = "beginner" | "easy" | "intermediate" | "advanced" | "expert" | "master";

const DIFFICULTY_VALUES: Record<DifficultyLevel, number> = {
  beginner: 1,
  easy: 2,
  intermediate: 3,
  advanced: 4,
  expert: 5,
  master: 6,
};

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  beginner: "Beginner",
  easy: "Easy",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
  master: "Master",
};

export function createDifficulty(level: DifficultyLevel): DomainDifficulty {
  return {
    value: level,
    get numericValue(): number {
      return DIFFICULTY_VALUES[level];
    },
    get label(): string {
      return DIFFICULTY_LABELS[level];
    },
    isHarderThan(other: DomainDifficulty): boolean {
      return this.numericValue > other.numericValue;
    },
    isEasierThan(other: DomainDifficulty): boolean {
      return this.numericValue < other.numericValue;
    },
    equals(other: DomainDifficulty): boolean {
      return this.value === other.value;
    },
  };
}

export function difficultyFromScore(score: number, maxScore: number): DomainDifficulty {
  const ratio = maxScore > 0 ? score / maxScore : 0;
  if (ratio >= 0.9) return createDifficulty("master");
  if (ratio >= 0.75) return createDifficulty("expert");
  if (ratio >= 0.6) return createDifficulty("advanced");
  if (ratio >= 0.4) return createDifficulty("intermediate");
  if (ratio >= 0.2) return createDifficulty("easy");
  return createDifficulty("beginner");
}
