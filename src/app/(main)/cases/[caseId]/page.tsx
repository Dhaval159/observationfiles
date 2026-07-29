import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Case Overview - The Observation Files",
  description: "View case details, objectives, and progress.",
};

interface CaseDetailPageProps {
  params: Promise<{ caseId: string }>;
}

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { caseId } = await params;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Case Overview</h1>
      </div>
      <p className="text-muted-foreground">Case ID: {caseId}</p>
    </div>
  );
}
