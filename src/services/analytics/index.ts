import { featureFlags } from "@/config/feature-flags";
import { logger } from "@/lib/logger";

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: string;
}

export const analyticsService = {
  track(event: AnalyticsEvent): void {
    if (!featureFlags.analytics) return;

    try {
      logger.debug("Analytics event", event as unknown as Record<string, unknown>);
    } catch {
      // Analytics failures should never break the app
    }
  },

  pageView(path: string): void {
    this.track({ name: "page_view", properties: { path } });
  },

  identify(userId: string, traits?: Record<string, unknown>): void {
    this.track({ name: "identify", properties: { userId, ...traits } });
  },
};
