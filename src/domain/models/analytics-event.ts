export interface AnalyticsEventData {
  readonly id: string;
  readonly sessionId: string;
  readonly playerId: string;
  readonly caseId: string | null;
  readonly eventType: string;
  readonly category: string;
  readonly action: string;
  readonly label: string | null;
  readonly value: number | null;
  readonly properties: Record<string, unknown>;
  readonly screenName: string | null;
  readonly url: string | null;
  readonly duration: number | null;
  readonly deviceInfo: Record<string, string>;
  readonly timestamp: string;
  readonly clientTimestamp: string;
  readonly sequenceNumber: number;
}

export interface AnalyticsSession {
  readonly sessionId: string;
  readonly playerId: string;
  readonly startedAt: string;
  readonly endedAt: string | null;
  readonly eventCount: number;
  readonly duration: number;
  readonly isActive: boolean;
}
