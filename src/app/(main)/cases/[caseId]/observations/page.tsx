import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Observations - The Observation Files",
  description: "Review your observations and deductions for the case.",
};

interface ObservationsPageProps {
  params: Promise<{ caseId: string }>;
}

export default async function ObservationsPage({ params }: ObservationsPageProps) {
  const { caseId } = await params;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Observations</h1>
      </div>
      <p className="text-muted-foreground">Case ID: {caseId}</p>
    </div>
  );
}
