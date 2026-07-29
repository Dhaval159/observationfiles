export interface TimelineEvent {
  id: string;
  caseId: string;
  title: string;
  description: string;
  timestamp: string;
  duration: number | null;
  location: string | null;
  participants: string[];
  evidenceIds: string[];
  certainty: "confirmed" | "likely" | "uncertain" | "disputed";
}

export interface Timeline {
  id: string;
  caseId: string;
  events: TimelineEvent[];
  startTime: string;
  endTime: string;
}

export type TimelineEventType =
  | "event"
  | "alibi"
  | "discovery"
  | "testimony"
  | "crime"
  | "arrest"
  | "death"
  | "meeting"
  | "phone_call"
  | "transaction";

export interface TimelineEventDependency {
  dependsOn: string;
  dependencyType: "requires" | "contradicts" | "supports" | "precedes" | "follows";
}

export interface TimelineEventEstimation {
  estimatedTime: string;
  confirmedTime: string | null;
  uncertaintyMinutes: number | null;
  estimatedBy: string | null;
  confirmedBy: string | null;
}

export interface TimelineConflict {
  eventA: string;
  eventB: string;
  conflictType: "overlap" | "contradiction" | "impossibility";
  resolutionNotes: string | null;
}

export interface FullTimelineEvent extends TimelineEvent {
  eventType: TimelineEventType;
  dependencies: TimelineEventDependency[] | null;
  estimation: TimelineEventEstimation | null;
  order: number;
  isDiscovered: boolean;
  isAnalyzed: boolean;
  notes: string | null;
  tags: string[];
}

export interface TimelineState {
  events: FullTimelineEvent[];
  conflicts: TimelineConflict[];
  validationErrors: TimelineValidation[];
  isComplete: boolean;
}

export interface TimelineValidation {
  eventId: string;
  error: "missing_dependency" | "time_conflict" | "impossible_order" | "circular_dependency";
  message: string;
}

export interface TimelinePlayerLayout {
  ordering: "chronological" | "reverse" | "custom";
  pinnedEvents: string[];
  zoomLevel: number;
  filterCriteria: Record<string, unknown>;
}
