export interface DomainStatus<T extends string> {
  readonly value: T;
  readonly isFinal: boolean;
  readonly isActive: boolean;
  readonly isPending: boolean;
  equals(other: DomainStatus<T>): boolean;
  toString(): string;
}

export function createDomainStatus<T extends string>(
  value: T,
  options?: {
    isFinal?: boolean;
    isActive?: boolean;
    isPending?: boolean;
  },
): DomainStatus<T> {
  return {
    value,
    isFinal: options?.isFinal ?? false,
    isActive: options?.isActive ?? false,
    isPending: options?.isPending ?? false,
    equals(other: DomainStatus<T>): boolean {
      return this.value === other.value;
    },
    toString(): string {
      return this.value;
    },
  };
}
