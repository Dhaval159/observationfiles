"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { InvestigationWorkspace } from "@/features/workspace/components/investigation-workspace";
import { useNavigationStore } from "@/stores/navigation-store";

export default function WorkspacePage() {
  const params = useParams();
  const caseId = params.caseId as string;
  const setBreadcrumbs = useNavigationStore((s) => s.setBreadcrumbs);

  useEffect(() => {
    setBreadcrumbs([
      { label: "Cases", href: "/cases" },
      { label: caseId, href: `/cases/${caseId}` },
      { label: "Workspace" },
    ]);
  }, [caseId, setBreadcrumbs]);

  return (
    <InvestigationWorkspace
      caseName={`Case #${caseId}`}
      caseProgress={0}
      currentObjective="Begin investigation"
    />
  );
}
