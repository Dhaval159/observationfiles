import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Investigation - The Observation Files",
  description: "Investigate the crime scene, collect evidence, and make observations.",
};

interface InvestigatePageProps {
  params: Promise<{ caseId: string }>;
}

export default async function InvestigatePage({ params }: InvestigatePageProps) {
  const { caseId } = await params;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Investigation</h1>
      </div>
      <p className="text-muted-foreground">Case ID: {caseId}</p>
    </div>
  );
}
