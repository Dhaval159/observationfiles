export interface DomainTimestamp {
  readonly value: Date;
  readonly iso: string;
  readonly unix: number;
  isBefore(other: DomainTimestamp): boolean;
  isAfter(other: DomainTimestamp): boolean;
  isBetween(start: DomainTimestamp, end: DomainTimestamp): boolean;
  differenceInSeconds(other: DomainTimestamp): number;
  differenceInMinutes(other: DomainTimestamp): number;
  addSeconds(seconds: number): DomainTimestamp;
  addMinutes(minutes: number): DomainTimestamp;
  toISOString(): string;
  equals(other: DomainTimestamp): boolean;
}

export function createDomainTimestamp(value?: Date | string | number): DomainTimestamp {
  const date = value instanceof Date ? value : new Date(value ?? Date.now());
  return {
    value: date,
    get iso(): string {
      return date.toISOString();
    },
    get unix(): number {
      return date.getTime();
    },
    isBefore(other: DomainTimestamp): boolean {
      return this.unix < other.unix;
    },
    isAfter(other: DomainTimestamp): boolean {
      return this.unix > other.unix;
    },
    isBetween(start: DomainTimestamp, end: DomainTimestamp): boolean {
      return this.unix >= start.unix && this.unix <= end.unix;
    },
    differenceInSeconds(other: DomainTimestamp): number {
      return Math.abs(this.unix - other.unix) / 1000;
    },
    differenceInMinutes(other: DomainTimestamp): number {
      return Math.abs(this.unix - other.unix) / 60000;
    },
    addSeconds(seconds: number): DomainTimestamp {
      return createDomainTimestamp(new Date(date.getTime() + seconds * 1000));
    },
    addMinutes(minutes: number): DomainTimestamp {
      return createDomainTimestamp(new Date(date.getTime() + minutes * 60000));
    },
    toISOString(): string {
      return date.toISOString();
    },
    equals(other: DomainTimestamp): boolean {
      return this.unix === other.unix;
    },
  };
}

export function now(): DomainTimestamp {
  return createDomainTimestamp();
}
