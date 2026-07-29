import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Evidence - The Observation Files",
  description: "Review and analyze collected evidence for the case.",
};

interface EvidencePageProps {
  params: Promise<{ caseId: string }>;
}

export default async function EvidencePage({ params }: EvidencePageProps) {
  const { caseId } = await params;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Evidence</h1>
      </div>
      <p className="text-muted-foreground">Case ID: {caseId}</p>
    </div>
  );
}
