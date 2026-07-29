import { createConfidence, type Confidence } from "../value-objects/confidence";

export function calculateAverageConfidence(confidences: Confidence[]): Confidence {
  if (confidences.length === 0) return createConfidence(0);
  const sum = confidences.reduce((acc, c) => acc + c.value, 0);
  return createConfidence(sum / confidences.length);
}

export function calculateWeightedConfidence(entries: Array<{ confidence: Confidence; weight: number }>): Confidence {
  if (entries.length === 0) return createConfidence(0);
  const totalWeight = entries.reduce((sum, e) => sum + e.weight, 0);
  if (totalWeight === 0) return createConfidence(0);
  const weightedSum = entries.reduce((sum, e) => sum + e.confidence.value * e.weight, 0);
  return createConfidence(weightedSum / totalWeight);
}

export function combineConfidenceBoosts(boosts: number[]): number {
  if (boosts.length === 0) return 0;
  let combined = 0;
  for (const boost of boosts) {
    combined = combined + boost * (1 - combined);
  }
  return Math.min(1, combined);
}

export function degradeConfidence(confidence: Confidence, degradationRate: number, timeElapsedSeconds: number): Confidence {
  if (degradationRate <= 0) return confidence;
  const degraded = confidence.value * Math.exp(-degradationRate * timeElapsedSeconds);
  return createConfidence(Math.max(0.1, Math.min(1, degraded)));
}

export function normalizeConfidence(value: number): Confidence {
  return createConfidence(Math.max(0, Math.min(1, value)));
}

export function confidenceToPercentage(confidence: Confidence): number {
  return confidence.percentage;
}

export function isConfidenceHigh(confidence: Confidence, threshold: number = 0.75): boolean {
  return confidence.value >= threshold;
}

export function isConfidenceLow(confidence: Confidence, threshold: number = 0.3): boolean {
  return confidence.value <= threshold;
}

export function certaintyFromEvidenceCount(
  collectedCount: number,
  totalCount: number,
  minConfidence: number = 0.1,
  maxConfidence: number = 0.95,
): Confidence {
  if (totalCount === 0) return createConfidence(minConfidence);
  const ratio = collectedCount / totalCount;
  return createConfidence(minConfidence + ratio * (maxConfidence - minConfidence));
}
