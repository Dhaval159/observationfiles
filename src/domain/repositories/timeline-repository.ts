import type { Result } from "../results/result";
import type { FullTimelineEvent, TimelineConflict, Timeline } from "../../types/timeline";

export interface TimelineRepository {
  findByCase(caseId: string): Promise<Result<Timeline>>;
  getEvent(eventId: string): Promise<Result<FullTimelineEvent>>;
  getEvents(caseId: string): Promise<Result<FullTimelineEvent[]>>;
  addEvent(caseId: string, event: Omit<FullTimelineEvent, "id" | "caseId">): Promise<Result<FullTimelineEvent>>;
  updateEvent(eventId: string, event: Partial<FullTimelineEvent>): Promise<Result<FullTimelineEvent>>;
  deleteEvent(eventId: string): Promise<Result<void>>;
  reorderEvents(caseId: string, eventOrder: string[]): Promise<Result<FullTimelineEvent[]>>;
  findConflicts(caseId: string): Promise<Result<TimelineConflict[]>>;
  resolveConflict(conflictId: string): Promise<Result<TimelineConflict>>;
  findDiscoveredEvents(caseId: string): Promise<Result<FullTimelineEvent[]>>;
}
