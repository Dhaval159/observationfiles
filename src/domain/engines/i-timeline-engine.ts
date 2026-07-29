import type { Result } from "../results/result";
import type { FullTimelineEvent, Timeline, TimelineConflict } from "../../types/timeline";

export interface ITimelineEngine {
  readonly id: string;
  readonly name: string;

  getTimeline(caseId: string, playerId: string): Promise<Result<Timeline>>;
  getEvents(caseId: string, playerId: string): Promise<Result<FullTimelineEvent[]>>;
  getEvent(eventId: string): Promise<Result<FullTimelineEvent>>;
  addEvent(caseId: string, event: Omit<FullTimelineEvent, "id" | "caseId">, playerId: string): Promise<Result<FullTimelineEvent>>;
  updateEvent(eventId: string, updates: Partial<FullTimelineEvent>, playerId: string): Promise<Result<FullTimelineEvent>>;
  removeEvent(eventId: string, playerId: string): Promise<Result<void>>;
  reorderEvents(caseId: string, eventIds: string[], playerId: string): Promise<Result<FullTimelineEvent[]>>;
  findConflicts(caseId: string, playerId: string): Promise<Result<TimelineConflict[]>>;
  resolveConflict(conflictId: string, playerId: string): Promise<Result<TimelineConflict>>;
  validateTimeline(caseId: string, playerId: string): Promise<Result<{ isValid: boolean; issues: string[] }>>;
  getSuggestedEventOrder(caseId: string, playerId: string): Promise<Result<FullTimelineEvent[]>>;
  isEventDiscovered(eventId: string): Promise<Result<boolean>>;
  discoverEvent(eventId: string, playerId: string): Promise<Result<FullTimelineEvent>>;
}
