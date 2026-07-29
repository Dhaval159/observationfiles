export interface DomainId {
  readonly value: string;
  readonly prefix?: string;
  toString(): string;
  equals(other: DomainId): boolean;
}

export function createDomainId(prefix?: string, value?: string): DomainId {
  const id = value ?? crypto.randomUUID();
  return {
    value: id,
    prefix,
    toString(): string {
      return this.prefix ? `${this.prefix}_${this.value}` : this.value;
    },
    equals(other: DomainId): boolean {
      return this.value === other.value;
    },
  };
}

export function isValidDomainId(id: string): boolean {
  return /^[a-zA-Z0-9_:-]+$/.test(id);
}

export type EntityId = string & { readonly __brand: "EntityId" };
export type CaseId = string & { readonly __brand: "CaseId" };
export type EvidenceId = string & { readonly __brand: "EvidenceId" };
export type ObservationId = string & { readonly __brand: "ObservationId" };
export type TimelineId = string & { readonly __brand: "TimelineId" };
export type NpcId = string & { readonly __brand: "NpcId" };
export type PlayerId = string & { readonly __brand: "PlayerId" };
export type TheoryNodeId = string & { readonly __brand: "TheoryNodeId" };
export type TheoryConnectionId = string & { readonly __brand: "TheoryConnectionId" };
export type LocationId = string & { readonly __brand: "LocationId" };
export type AchievementId = string & { readonly __brand: "AchievementId" };
export type SaveId = string & { readonly __brand: "SaveId" };
