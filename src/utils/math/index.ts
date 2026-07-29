export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

export function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return (value - min) / (max - min);
}

export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function weightedRandom<T>(items: T[], weights: number[]): T {
  if (items.length === 0) {
    throw new Error("Items array must not be empty");
  }
  if (items.length !== weights.length) {
    throw new Error("Items and weights must have the same length");
  }

  const totalWeight = weights.reduce((acc, w) => acc + w, 0);
  if (totalWeight <= 0) {
    throw new Error("Total weight must be greater than zero");
  }

  let random = Math.random() * totalWeight;
  for (let i = 0; i < items.length; i++) {
    random -= weights[i]!;
    if (random <= 0) {
      return items[i]!;
    }
  }

  return items[items.length - 1]!;
}

export function calculateConfidence(
  evidenceCount: number,
  totalEvidence: number,
  observationCount: number,
  totalObservations: number,
): number {
  if (totalEvidence === 0 || totalObservations === 0) return 0;

  const evidenceWeight = 0.6;
  const observationWeight = 0.4;

  const evidenceRatio = totalEvidence > 0 ? evidenceCount / totalEvidence : 0;
  const observationRatio = totalObservations > 0 ? observationCount / totalObservations : 0;

  return clamp(evidenceRatio * evidenceWeight + observationRatio * observationWeight, 0, 1);
}

export function calculateStarRating(
  score: number,
  maxScore: number,
  thresholds: Record<number, number>,
): number {
  if (maxScore <= 0) return 0;

  const normalized = clamp(score / maxScore, 0, 1);
  let stars = 0;

  const sortedThresholds = Object.entries(thresholds)
    .map(([star, threshold]) => ({ stars: Number(star), threshold }))
    .sort((a, b) => b.stars - a.stars);

  for (const entry of sortedThresholds) {
    if (normalized >= entry.threshold) {
      stars = entry.stars;
      break;
    }
  }

  return stars;
}

export function calculatePercentile(score: number, allScores: number[]): number {
  if (allScores.length === 0) return 0;

  const sorted = [...allScores].sort((a, b) => a - b);
  const countLower = sorted.filter((s) => s < score).length;
  return (countLower / sorted.length) * 100;
}

export function calculateProgress(completed: number, total: number): number {
  if (total <= 0) return 0;
  return clamp((completed / total) * 100, 0, 100);
}

export function calculateTimeBonus(
  maxBonus: number,
  decayRate: number,
  elapsedMinutes: number,
): number {
  return maxBonus * Math.exp(-decayRate * elapsedMinutes);
}

export function exponentialDecay(value: number, rate: number, time: number): number {
  return value * Math.exp(-rate * time);
}

export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function movingAverage(values: number[], windowSize: number): number[] {
  if (values.length === 0 || windowSize <= 0) return [];
  const result: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const subset = values.slice(start, i + 1);
    const avg = subset.reduce((acc, v) => acc + v, 0) / subset.length;
    result.push(avg);
  }
  return result;
}

export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = values.reduce((acc, v) => acc + v, 0) / values.length;
  const variance = values.reduce((acc, v) => acc + (v - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1]! + sorted[mid]!) / 2;
  }
  return sorted[mid]!;
}

export function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return sum(values) / values.length;
}
