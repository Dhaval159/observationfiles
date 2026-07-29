export interface Confidence {
  readonly value: number;
  readonly percentage: number;
  readonly category: ConfidenceCategory;
  readonly isMediumOrHigher: boolean;
  readonly isHigh: boolean;
  clamp(min: number, max: number): Confidence;
  add(amount: number): Confidence;
  subtract(amount: number): Confidence;
  equals(other: Confidence): boolean;
  greaterThan(other: Confidence): boolean;
  toFixed(decimals: number): string;
}

export type ConfidenceCategory = "very_low" | "low" | "medium" | "high" | "very_high" | "certain";

export function createConfidence(value: number): Confidence {
  const clamped = Math.max(0, Math.min(1, value));
  const category = getConfidenceCategory(clamped);
  return {
    value: clamped,
    get percentage(): number {
      return Math.round(clamped * 100);
    },
    category,
    get isMediumOrHigher(): boolean {
      return clamped >= 0.5;
    },
    get isHigh(): boolean {
      return clamped >= 0.75;
    },
    clamp(min: number, max: number): Confidence {
      return createConfidence(Math.max(min, Math.min(max, this.value)));
    },
    add(amount: number): Confidence {
      return createConfidence(this.value + amount);
    },
    subtract(amount: number): Confidence {
      return createConfidence(this.value - amount);
    },
    equals(other: Confidence): boolean {
      return this.value === other.value;
    },
    greaterThan(other: Confidence): boolean {
      return this.value > other.value;
    },
    toFixed(decimals: number): string {
      return this.value.toFixed(decimals);
    },
  };
}

function getConfidenceCategory(value: number): ConfidenceCategory {
  if (value >= 1) return "certain";
  if (value >= 0.9) return "very_high";
  if (value >= 0.7) return "high";
  if (value >= 0.5) return "medium";
  if (value >= 0.3) return "low";
  return "very_low";
}

export const CONFIDENCE_MIN = createConfidence(0);
export const CONFIDENCE_MAX = createConfidence(1);
export const CONFIDENCE_CERTAIN = createConfidence(1);
export const CONFIDENCE_UNKNOWN = createConfidence(0.5);
