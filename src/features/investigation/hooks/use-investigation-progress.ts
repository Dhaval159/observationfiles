"use client";

import { useCallback, useEffect, useState } from "react";
import { getInvestigationEngine } from "../services/investigation-engine-service";

export function useInvestigationProgress(playerId: string | null) {
  const [overall, setOverall] = useState(0);
  const [objectives, setObjectives] = useState(0);
  const [evidence, setEvidence] = useState(0);
  const [observations, setObservations] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(() => {
    if (!playerId) return;
    setIsLoading(true);
    try {
      const engine = getInvestigationEngine();
      const result = engine.getProgressSummary(playerId);
      if (result.success) {
        setOverall(result.data.overall);
        setObjectives(result.data.objectives);
        setEvidence(result.data.evidence);
        setObservations(result.data.observations);
      }
    } finally {
      setIsLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { overall, objectives, evidence, observations, isLoading, refresh };
}
