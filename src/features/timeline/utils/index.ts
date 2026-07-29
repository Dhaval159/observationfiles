import type { FullTimelineEvent } from "@/types/timeline";

export function sortEventsByTime(events: FullTimelineEvent[]): FullTimelineEvent[] {
  return [...events].sort((a, b) => {
    const timeA = a.estimation?.confirmedTime ?? a.estimation?.estimatedTime ?? a.timestamp;
    const timeB = b.estimation?.confirmedTime ?? b.estimation?.estimatedTime ?? b.timestamp;
    return timeA.localeCompare(timeB);
  });
}

export function sortEventsByOrder(events: FullTimelineEvent[]): FullTimelineEvent[] {
  return [...events].sort((a, b) => a.order - b.order);
}

export function detectTimeOverlap(eventA: FullTimelineEvent, eventB: FullTimelineEvent): boolean {
  const rangeA = getEventTimeRange(eventA);
  const rangeB = getEventTimeRange(eventB);
  return rangeA.start < rangeB.end && rangeB.start < rangeA.end;
}

export function detectDependencyViolation(
  event: FullTimelineEvent,
  order: string[],
  _allEvents: Map<string, FullTimelineEvent>,
): boolean {
  if (!event.dependencies) return false;
  const eventIndex = order.indexOf(event.id);
  if (eventIndex === -1) return false;

  for (const dep of event.dependencies) {
    const depIndex = order.indexOf(dep.dependsOn);
    if (depIndex === -1) continue;

    if (dep.dependencyType === "precedes" && depIndex >= eventIndex) {
      return true;
    }
    if (dep.dependencyType === "follows" && depIndex <= eventIndex) {
      return true;
    }
    if (dep.dependencyType === "requires" && depIndex > eventIndex) {
      return true;
    }
  }
  return false;
}

export function getEventTimeRange(event: FullTimelineEvent): { start: Date; end: Date } {
  const timeStr =
    event.estimation?.confirmedTime ?? event.estimation?.estimatedTime ?? event.timestamp;
  const start = new Date(timeStr);

  const durationMinutes = event.duration ?? 0;
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  return { start, end };
}

export function formatTimelineTime(timeStr: string): string {
  const date = new Date(timeStr);
  if (isNaN(date.getTime())) return timeStr;
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function calculateTimelineGap(eventA: FullTimelineEvent, eventB: FullTimelineEvent): number {
  const rangeA = getEventTimeRange(eventA);
  const rangeB = getEventTimeRange(eventB);

  const [earlier, later] = rangeA.end <= rangeB.start ? [rangeA, rangeB] : [rangeB, rangeA];

  const diffMs = later.start.getTime() - earlier.end.getTime();
  return Math.max(0, Math.floor(diffMs / (60 * 1000)));
}

export function categorizeEventsByCertainty(
  events: FullTimelineEvent[],
): Record<string, FullTimelineEvent[]> {
  const result: Record<string, FullTimelineEvent[]> = {
    confirmed: [],
    likely: [],
    uncertain: [],
    disputed: [],
  };

  for (const event of events) {
    const bucket = result[event.certainty];
    if (bucket) {
      bucket.push(event);
    }
  }

  return result;
}

export function eventsAreContradictory(a: FullTimelineEvent, b: FullTimelineEvent): boolean {
  if (!a.dependencies || !b.dependencies) return false;

  const aContradictsB = a.dependencies.some(
    (d) => d.dependsOn === b.id && d.dependencyType === "contradicts",
  );
  const bContradictsA = b.dependencies.some(
    (d) => d.dependsOn === a.id && d.dependencyType === "contradicts",
  );

  return aContradictsB || bContradictsA;
}
