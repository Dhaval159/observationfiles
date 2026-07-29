export interface Priority {
  readonly value: PriorityLevel;
  readonly numericValue: number;
  readonly label: string;
  isHigherThan(other: Priority): boolean;
  isLowerThan(other: Priority): boolean;
  equals(other: Priority): boolean;
}

export type PriorityLevel = "lowest" | "low" | "normal" | "high" | "highest" | "critical";

const PRIORITY_VALUES: Record<PriorityLevel, number> = {
  lowest: 1,
  low: 2,
  normal: 3,
  high: 4,
  highest: 5,
  critical: 6,
};

const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  lowest: "Lowest",
  low: "Low",
  normal: "Normal",
  high: "High",
  highest: "Highest",
  critical: "Critical",
};

export function createPriority(level: PriorityLevel): Priority {
  return {
    value: level,
    get numericValue(): number {
      return PRIORITY_VALUES[level];
    },
    get label(): string {
      return PRIORITY_LABELS[level];
    },
    isHigherThan(other: Priority): boolean {
      return this.numericValue > other.numericValue;
    },
    isLowerThan(other: Priority): boolean {
      return this.numericValue < other.numericValue;
    },
    equals(other: Priority): boolean {
      return this.value === other.value;
    },
  };
}
