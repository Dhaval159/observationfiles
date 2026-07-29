import { createDomainProgress, type DomainProgress } from "../value-objects/progress";

export function calculateOverallProgress(caseProgresses: DomainProgress[]): DomainProgress {
  if (caseProgresses.length === 0) return createDomainProgress(0, 0);
  const totalCurrent = caseProgresses.reduce((sum, p) => sum + p.current, 0);
  const totalMax = caseProgresses.reduce((sum, p) => sum + p.total, 0);
  return createDomainProgress(totalCurrent, totalMax);
}

export function calculateWeightedProgress(
  entries: Array<{ progress: DomainProgress; weight: number }>,
): DomainProgress {
  if (entries.length === 0) return createDomainProgress(0, 0);
  const totalWeight = entries.reduce((sum, e) => sum + e.weight, 0);
  if (totalWeight === 0) return createDomainProgress(0, 0);
  let weightedCurrent = 0;
  let weightedTotal = 0;
  for (const entry of entries) {
    if (entry.progress.total > 0) {
      weightedCurrent += (entry.progress.current / entry.progress.total) * entry.weight;
    }
    weightedTotal += entry.weight;
  }
  return createDomainProgress(Math.round(weightedCurrent * 100), weightedTotal * 100);
}

export function calculateCategoryScore(
  collected: number,
  total: number,
  maxScore: number = 100,
): number {
  if (total === 0) return 0;
  return Math.round((collected / total) * maxScore);
}

export function estimateRemainingTime(
  elapsedSeconds: number,
  progress: DomainProgress,
): number {
  if (progress.current === 0) return 0;
  const rate = progress.current / elapsedSeconds;
  if (rate <= 0) return 0;
  return Math.round(progress.remaining / rate);
}

export function calculateProgressionRate(
  startTime: number,
  endTime: number,
  currentProgress: number,
  startProgress: number,
): number {
  const timeDelta = endTime - startTime;
  const progressDelta = currentProgress - startProgress;
  if (timeDelta <= 0 || progressDelta <= 0) return 0;
  return progressDelta / timeDelta;
}

export function interpolateProgress(
  startValue: number,
  endValue: number,
  progress: number,
): number {
  const t = Math.max(0, Math.min(1, progress));
  return startValue + (endValue - startValue) * t;
}
