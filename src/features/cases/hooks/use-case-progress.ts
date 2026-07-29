"use client";

import { useCallback, useEffect, useState } from "react";
import { getCaseEngine } from "../services/case-engine-service";
import type { CaseProgress } from "@/domain/repositories/progress-repository";

export function useCaseProgress(caseId: string | null, playerId: string | null) {
  const [progress, setProgress] = useState<CaseProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshProgress = useCallback(async () => {
    if (!caseId || !playerId) return;

    setIsLoading(true);
    try {
      const engine = getCaseEngine();
      const result = await engine.getCaseProgress(caseId, playerId);
      if (result.success) {
        setProgress(result.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [caseId, playerId]);

  const completeCase = useCallback(async () => {
    if (!caseId || !playerId) return;

    try {
      const engine = getCaseEngine();
      const result = await engine.completeCase(caseId, playerId);
      if (result.success) {
        setProgress(result.data);
      }
    } catch {
      // handled by engine
    }
  }, [caseId, playerId]);

  useEffect(() => {
    if (caseId && playerId) {
      refreshProgress();
    }
  }, [caseId, playerId, refreshProgress]);

  return {
    progress,
    isLoading,
    refreshProgress,
    completeCase,
  };
}
