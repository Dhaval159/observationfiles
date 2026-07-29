import type { DomainTimestamp } from "../value-objects/timestamp";

export interface DomainEvent {
  readonly id: string;
  readonly type: string;
  readonly timestamp: DomainTimestamp;
  readonly source: string;
  readonly correlationId?: string;
  readonly causationId?: string;
  readonly version?: number;
  readonly metadata?: Record<string, unknown>;
}

export interface EventHandler<TEvent extends DomainEvent = DomainEvent> {
  readonly eventType: string;
  handle(event: TEvent): Promise<void>;
  canHandle(event: DomainEvent): event is TEvent;
}

export interface EventBus {
  publish<TEvent extends DomainEvent>(event: TEvent): Promise<void>;
  publishBatch<TEvent extends DomainEvent>(events: TEvent[]): Promise<void>;
  subscribe<TEvent extends DomainEvent>(handler: EventHandler<TEvent>): () => void;
  unsubscribe(eventType: string, handler: EventHandler): void;
  getSubscriberCount(eventType: string): number;
  clearSubscribers(eventType?: string): void;
}

export interface EventStore {
  append<TEvent extends DomainEvent>(events: TEvent[]): Promise<void>;
  getEvents(aggregateId: string, options?: {
    fromVersion?: number;
    toVersion?: number;
    eventTypes?: string[];
    fromDate?: DomainTimestamp;
    toDate?: DomainTimestamp;
  }): Promise<DomainEvent[]>;
  getLatestVersion(aggregateId: string): Promise<number>;
  replay(aggregateId: string, handler: (event: DomainEvent) => Promise<void>): Promise<void>;
}

export function createDomainEvent(
  id: string,
  type: string,
  source: string,
  timestamp: DomainTimestamp,
  options?: {
    correlationId?: string;
    causationId?: string;
    version?: number;
    metadata?: Record<string, unknown>;
  },
): DomainEvent {
  return {
    id,
    type,
    source,
    timestamp,
    correlationId: options?.correlationId,
    causationId: options?.causationId,
    version: options?.version,
    metadata: options?.metadata,
  };
}
