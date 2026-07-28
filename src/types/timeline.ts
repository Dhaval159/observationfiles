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
