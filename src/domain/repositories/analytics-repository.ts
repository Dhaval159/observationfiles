import type { Result } from "../results/result";

export interface AnalyticsEventData {
  id: string;
  playerId: string;
  eventType: string;
  caseId?: string;
  properties: Record<string, unknown>;
  timestamp: string;
  sessionId?: string;
}

export interface AnalyticsRepository {
  trackEvent(event: AnalyticsEventData): Promise<Result<AnalyticsEventData>>;
  trackBatch(events: AnalyticsEventData[]): Promise<Result<AnalyticsEventData[]>>;
  getEvents(playerId: string, options?: {
    eventType?: string;
    caseId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<Result<AnalyticsEventData[]>>;
  getSummary(playerId: string): Promise<Result<Record<string, number>>>;
  getSessionEvents(sessionId: string): Promise<Result<AnalyticsEventData[]>>;
}
