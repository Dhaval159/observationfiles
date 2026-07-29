export type AnalyticsEventType =
  | "screen_view"
  | "case_started"
  | "case_completed"
  | "case_abandoned"
  | "evidence_discovered"
  | "observation_made"
  | "deduction_made"
  | "interrogation_started"
  | "interrogation_completed"
  | "contradiction_found"
  | "hint_used"
  | "timeline_event_placed"
  | "theory_node_created"
  | "theory_connection_created"
  | "achievement_unlocked"
  | "save_created"
  | "save_loaded"
  | "error_occurred"
  | "performance_metric"
  | "feature_used"
  | "custom";

export interface AnalyticsEvent {
  id: string;
  userId: string;
  type: AnalyticsEventType;
  timestamp: string;
  sessionId: string;
  caseId: string | null;
  properties: Record<string, unknown>;
  metadata: AnalyticsMetadata;
}

export interface AnalyticsMetadata {
  appVersion: string;
  platform: string;
  userAgent: string;
  screenResolution: string;
  language: string;
  timezone: string;
  networkType: string | null;
}

export interface ScreenViewEvent extends AnalyticsEvent {
  type: "screen_view";
  properties: {
    screenName: string;
    previousScreen: string | null;
    timeOnPreviousScreen: number;
    referrer: string | null;
  };
}

export interface PerformanceMetric {
  id: string;
  userId: string;
  timestamp: string;
  metric: string;
  value: number;
  context: Record<string, unknown>;
}

export interface AnalyticsConfig {
  enabled: boolean;
  endpoint: string | null;
  batchSize: number;
  flushInterval: number;
  maxQueueSize: number;
  sampleRate: number;
  anonymizeIp: boolean;
  respectDoNotTrack: boolean;
}

export interface AnalyticsTracker {
  track: (event: Omit<AnalyticsEvent, "id" | "timestamp" | "metadata">) => void;
  trackScreen: (screenName: string, previousScreen?: string) => void;
  trackPerformance: (metric: PerformanceMetric) => void;
  startSession: () => string;
  endSession: () => void;
  flush: () => Promise<void>;
  setUserId: (userId: string) => void;
  setCaseId: (caseId: string | null) => void;
  getQueueSize: () => number;
}
