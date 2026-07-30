"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { InvestigationWorkspace } from "@/features/workspace/components/investigation-workspace";
import { useNavigationStore } from "@/stores/navigation-store";
import { useCurrentCase } from "@/features/cases/hooks/use-current-case";
import { useEvidenceInventory } from "@/features/evidence/hooks";
import { useObservations } from "@/features/observation/hooks";

export default function WorkspacePage() {
  const params = useParams();
  const caseId = params.caseId as string;
  const playerId = "player_1";
  const setBreadcrumbs = useNavigationStore((s) => s.setBreadcrumbs);

  useEffect(() => {
    setBreadcrumbs([
      { label: "Cases", href: "/cases" },
      { label: "The Poisoned Pinot", href: `/cases/${caseId}` },
      { label: "Workspace" },
    ]);
  }, [caseId, setBreadcrumbs]);

  const { currentCase } = useCurrentCase(caseId, playerId);
  const inventory = useEvidenceInventory();
  const { entries: observations } = useObservations(caseId, playerId);

  const collectedCount = inventory.length;
  const observedCount = observations.filter(
    (o) => o.lifecycleState === "observed" || o.lifecycleState === "verified",
  ).length;

  // Compute overall progress percentage (14 total elements as baseline)
  const progressPercent = Math.min(100, Math.round(((collectedCount + observedCount) / 14) * 100));

  // Dynamically guide player objectives
  const hasOfficeKey = inventory.some((e) => e.id === "ev-office-key");
  const isRingCollected = inventory.some((e) => e.id === "ev-cyanide-ring");

  let currentObjective = "Investigate the Wine Cellar Scene";
  if (collectedCount === 0) {
    currentObjective = "Examine Julien's body and the bottle in the cellar.";
  } else if (!hasOfficeKey) {
    currentObjective = "Question Elena Rostova in the Tasting Room to acquire Arthur's office key.";
  } else if (!isRingCollected) {
    currentObjective =
      "Search Arthur's Private Office and interrogate Arthur to expose alibi gaps.";
  } else {
    currentObjective = "Compile the facts in the Theory Board and click the Accuse button below!";
  }

  return (
    <InvestigationWorkspace
      caseName={currentCase?.title || "The Poisoned Pinot"}
      caseProgress={progressPercent}
      currentObjective={currentObjective}
    />
  );
}
