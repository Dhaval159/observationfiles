import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Timeline - The Observation Files",
  description: "Piece together the timeline of events for the case.",
};

interface TimelinePageProps {
  params: Promise<{ caseId: string }>;
}

export default async function TimelinePage({ params }: TimelinePageProps) {
  const { caseId } = await params;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Timeline</h1>
      </div>
      <p className="text-muted-foreground">Case ID: {caseId}</p>
    </div>
  );
}
