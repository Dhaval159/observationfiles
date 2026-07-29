export interface Rating {
  readonly value: number;
  readonly stars: 1 | 2 | 3 | 4 | 5;
  readonly displayString: string;
  readonly isHighRating: boolean;
  readonly isLowRating: boolean;
  equals(other: Rating): boolean;
  greaterThan(other: Rating): boolean;
}

export function createRating(stars: number): Rating {
  const clamped = Math.max(1, Math.min(5, Math.round(stars))) as 1 | 2 | 3 | 4 | 5;
  return {
    value: clamped,
    stars: clamped,
    get displayString(): string {
      return "★".repeat(clamped) + "☆".repeat(5 - clamped);
    },
    get isHighRating(): boolean {
      return clamped >= 4;
    },
    get isLowRating(): boolean {
      return clamped <= 2;
    },
    equals(other: Rating): boolean {
      return this.value === other.value;
    },
    greaterThan(other: Rating): boolean {
      return this.value > other.value;
    },
  };
}

export const RATING_MIN = createRating(1);
export const RATING_MAX = createRating(5);
