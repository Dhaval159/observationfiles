export interface Percentage {
  readonly value: number;
  readonly decimal: number;
  readonly isComplete: boolean;
  readonly formatted: string;
  add(other: Percentage): Percentage;
  subtract(other: Percentage): Percentage;
  equals(other: Percentage): boolean;
  greaterThan(other: Percentage): boolean;
}

export function createPercentage(value: number): Percentage {
  const clamped = Math.max(0, Math.min(100, value));
  return {
    value: clamped,
    get decimal(): number {
      return clamped / 100;
    },
    get isComplete(): boolean {
      return clamped >= 100;
    },
    get formatted(): string {
      return `${Math.round(clamped)}%`;
    },
    add(other: Percentage): Percentage {
      return createPercentage(this.value + other.value);
    },
    subtract(other: Percentage): Percentage {
      return createPercentage(this.value - other.value);
    },
    equals(other: Percentage): boolean {
      return this.value === other.value;
    },
    greaterThan(other: Percentage): boolean {
      return this.value > other.value;
    },
  };
}

export const PERCENT_ZERO = createPercentage(0);
export const PERCENT_HUNDRED = createPercentage(100);
