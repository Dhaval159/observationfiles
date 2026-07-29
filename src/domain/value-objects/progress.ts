export interface DomainProgress {
  readonly current: number;
  readonly total: number;
  readonly percentage: number;
  readonly isComplete: boolean;
  readonly isStarted: boolean;
  readonly remaining: number;
  advance(amount: number): DomainProgress;
  percentageOfTotal(percent: number): number;
  equals(other: DomainProgress): boolean;
}

export function createDomainProgress(current: number, total: number): DomainProgress {
  const safeCurrent = Math.max(0, Math.min(total, current));
  const safeTotal = Math.max(0, total);
  return {
    current: safeCurrent,
    total: safeTotal,
    get percentage(): number {
      return safeTotal > 0 ? (safeCurrent / safeTotal) * 100 : 0;
    },
    get isComplete(): boolean {
      return safeCurrent >= safeTotal && safeTotal > 0;
    },
    get isStarted(): boolean {
      return safeCurrent > 0;
    },
    get remaining(): number {
      return safeTotal - safeCurrent;
    },
    advance(amount: number): DomainProgress {
      return createDomainProgress(this.current + amount, this.total);
    },
    percentageOfTotal(percent: number): number {
      return (percent / 100) * this.total;
    },
    equals(other: DomainProgress): boolean {
      return this.current === other.current && this.total === other.total;
    },
  };
}
