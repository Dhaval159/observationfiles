import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interrogation - The Observation Files",
  description: "Question the suspect and uncover the truth.",
};

interface InterrogatePageProps {
  params: Promise<{ caseId: string; npcId: string }>;
}

export default async function InterrogatePage({ params }: InterrogatePageProps) {
  const { caseId, npcId } = await params;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Interrogation</h1>
      </div>
      <p className="text-muted-foreground">
        Case ID: {caseId} | NPC ID: {npcId}
      </p>
    </div>
  );
}
