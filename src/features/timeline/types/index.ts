import type {
  FullTimelineEvent,
  TimelineState,
  TimelineValidation,
  TimelinePlayerLayout,
  TimelineConflict,
  TimelineEventType,
  TimelineEventDependency,
} from "@/types/timeline";

export interface TimelineEngineState {
  events: Map<string, FullTimelineEvent>;
  eventOrder: string[];
  conflicts: TimelineConflict[];
  validationErrors: TimelineValidation[];
  isDirty: boolean;
}

export interface TimelineEventPlacement {
  eventId: string;
  newIndex: number;
  isValid: boolean;
  conflicts: TimelineConflict[];
}

export interface TimelineValidationReport {
  isValid: boolean;
  errors: TimelineValidation[];
  warnings: TimelineValidation[];
  suggestions: string[];
}

export type {
  FullTimelineEvent,
  TimelineState,
  TimelineValidation,
  TimelinePlayerLayout,
  TimelineConflict,
  TimelineEventType,
  TimelineEventDependency,
};
