import type {
  AnalyticsEvent,
  AnalyticsConfig,
  AnalyticsMetadata,
  PerformanceMetric,
} from "@/types/analytics";
import { featureFlags } from "@/config/feature-flags";

const DEFAULT_CONFIG: AnalyticsConfig = {
  enabled: true,
  endpoint: null,
  batchSize: 10,
  flushInterval: 30000,
  maxQueueSize: 100,
  sampleRate: 1.0,
  anonymizeIp: false,
  respectDoNotTrack: true,
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function isDoNotTrack(): boolean {
  if (typeof window === "undefined") return false;
  return window.navigator.doNotTrack === "1" || window.navigator.doNotTrack === "yes";
}

export class AnalyticsService {
  private config: AnalyticsConfig;
  private queue: AnalyticsEvent[] = [];
  private userId = "";
  private caseId: string | null = null;
  private sessionId: string | null = null;
  private sessionStartTime: number | null = null;
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    if (this.config.respectDoNotTrack && isDoNotTrack()) {
      this.config.enabled = false;
    }

    if (this.config.enabled && this.config.flushInterval > 0) {
      this.flushTimer = setInterval(() => {
        this.flush().catch(() => {
          // flush failures are non-critical
        });
      }, this.config.flushInterval);
    }
  }

  track(event: Omit<AnalyticsEvent, "id" | "timestamp" | "metadata">): void {
    if (!this.config.enabled) return;
    if (!this.shouldSample()) return;

    const fullEvent: AnalyticsEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date().toISOString(),
      metadata: this.buildMetadata(),
      userId: event.userId || this.userId,
      sessionId: event.sessionId || this.sessionId || "",
      caseId: event.caseId ?? this.caseId,
    };

    this.enqueue(fullEvent);
  }

  trackScreen(screenName: string, previousScreen?: string): void {
    this.track({
      userId: this.userId,
      type: "screen_view",
      sessionId: this.sessionId || "",
      caseId: this.caseId,
      properties: {
        screenName,
        previousScreen: previousScreen ?? null,
        timeOnPreviousScreen: 0,
        referrer: document.referrer || null,
      },
    });
  }

  trackPerformance(metric: PerformanceMetric): void {
    this.track({
      userId: this.userId,
      type: "performance_metric",
      sessionId: this.sessionId || "",
      caseId: this.caseId,
      properties: {
        metric: metric.metric,
        value: metric.value,
        context: metric.context,
      },
    });
  }

  startSession(): string {
    this.sessionId = generateId();
    this.sessionStartTime = Date.now();
    return this.sessionId;
  }

  endSession(): void {
    if (this.sessionId) {
      this.track({
        userId: this.userId,
        type: "custom",
        sessionId: this.sessionId,
        caseId: this.caseId,
        properties: {
          action: "session_end",
          duration: this.sessionStartTime ? Date.now() - this.sessionStartTime : 0,
        },
      });
    }
    this.sessionId = null;
    this.sessionStartTime = null;
  }

  async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, this.config.batchSize);

    if (this.config.endpoint) {
      try {
        await fetch(this.config.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ events: batch }),
        });
      } catch {
        // Re-enqueue on failure
        this.queue.unshift(...batch);
      }
    } else {
      // Log to console for development
      for (const event of batch) {
        console.debug(`[Analytics] ${event.type}`, JSON.stringify(event.properties));
      }
    }
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  setCaseId(caseId: string | null): void {
    this.caseId = caseId;
  }

  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  private generateEventId(): string {
    return generateId();
  }

  private buildMetadata(): AnalyticsMetadata {
    return {
      appVersion: "1.0.0",
      platform: typeof navigator !== "undefined" ? navigator.platform || "unknown" : "unknown",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      screenResolution:
        typeof window !== "undefined"
          ? `${window.screen.width}x${window.screen.height}`
          : "unknown",
      language: typeof navigator !== "undefined" ? navigator.language : "unknown",
      timezone:
        typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "unknown",
      networkType: null,
    };
  }

  private enqueue(event: AnalyticsEvent): void {
    if (this.queue.length >= this.config.maxQueueSize) {
      this.queue.shift();
    }
    this.queue.push(event);

    if (this.queue.length >= this.config.batchSize) {
      this.flush().catch(() => {
        // non-critical
      });
    }
  }

  private shouldSample(): boolean {
    if (this.config.sampleRate >= 1.0) return true;
    return Math.random() < this.config.sampleRate;
  }
}

export const analyticsService = new AnalyticsService({
  enabled: featureFlags.analytics,
});
