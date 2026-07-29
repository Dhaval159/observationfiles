import type { Result } from "../results/result";
import type { AnalyticsEventData } from "../models/analytics-event";

export interface IAnalyticsEngine {
  readonly id: string;
  readonly name: string;

  trackEvent(event: Omit<AnalyticsEventData, "id">): Promise<Result<AnalyticsEventData>>;
  trackBatch(events: Omit<AnalyticsEventData, "id">[]): Promise<Result<AnalyticsEventData[]>>;
  getEvents(playerId: string, options?: {
    eventType?: string;
    caseId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<Result<AnalyticsEventData[]>>;
  getEventCount(playerId: string, eventType: string): Promise<Result<number>>;
  getSummary(playerId: string): Promise<Result<Record<string, number>>>;
  getFunnel(playerId: string, steps: string[]): Promise<Result<Record<string, number>>>;
  getSessionDuration(sessionId: string): Promise<Result<number>>;
  getSessionEvents(sessionId: string): Promise<Result<AnalyticsEventData[]>>;
  startSession(playerId: string): Promise<Result<string>>;
  endSession(sessionId: string): Promise<Result<void>>;
  isEnabled(): boolean;
  setEnabled(enabled: boolean): void;
  flush(): Promise<Result<void>>;
}
