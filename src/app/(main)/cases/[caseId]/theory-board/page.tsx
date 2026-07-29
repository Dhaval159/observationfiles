import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Theory Board - The Observation Files",
  description: "Connect evidence, suspects, and theories on your investigation board.",
};

interface TheoryBoardPageProps {
  params: Promise<{ caseId: string }>;
}

export default async function TheoryBoardPage({ params }: TheoryBoardPageProps) {
  const { caseId } = await params;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Theory Board</h1>
      </div>
      <p className="text-muted-foreground">Case ID: {caseId}</p>
    </div>
  );
}
