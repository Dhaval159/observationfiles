export interface DomainScore {
  readonly value: number;
  readonly formatted: string;
  readonly isPositive: boolean;
  readonly isMaximum: (max: number) => boolean;
  readonly asPercentage: (max: number) => number;
  add(points: number): DomainScore;
  subtract(points: number): DomainScore;
  multiply(factor: number): DomainScore;
  equals(other: DomainScore): boolean;
  greaterThan(other: DomainScore): boolean;
}

export function createScore(value: number): DomainScore {
  return {
    value,
    get formatted(): string {
      return value.toLocaleString();
    },
    get isPositive(): boolean {
      return value >= 0;
    },
    isMaximum(max: number): boolean {
      return value >= max;
    },
    asPercentage(max: number): number {
      return max > 0 ? (value / max) * 100 : 0;
    },
    add(points: number): DomainScore {
      return createScore(this.value + points);
    },
    subtract(points: number): DomainScore {
      return createScore(Math.max(0, this.value - points));
    },
    multiply(factor: number): DomainScore {
      return createScore(Math.round(this.value * factor));
    },
    equals(other: DomainScore): boolean {
      return this.value === other.value;
    },
    greaterThan(other: DomainScore): boolean {
      return this.value > other.value;
    },
  };
}

export const SCORE_ZERO = createScore(0);
