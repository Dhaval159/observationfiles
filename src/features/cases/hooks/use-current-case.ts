"use client";

import { useCallback, useEffect, useState } from "react";
import { getCaseEngine } from "../services/case-engine-service";
import type { FullCase } from "@/types/case";

export function useCurrentCase(caseId: string | null, playerId: string | null) {
  const [currentCase, setCurrentCase] = useState<FullCase | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCase = useCallback(async () => {
    if (!caseId || !playerId) return;

    setIsLoading(true);
    setError(null);

    try {
      const engine = getCaseEngine();
      const result = await engine.loadCase(caseId, playerId);

      if (result.success) {
        setCurrentCase(result.data);
      } else {
        setError(result.error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load case");
    } finally {
      setIsLoading(false);
    }
  }, [caseId, playerId]);

  const startCase = useCallback(async () => {
    if (!caseId || !playerId) return;

    setIsLoading(true);
    setError(null);

    try {
      const engine = getCaseEngine();
      const result = await engine.startCase(caseId, playerId);

      if (result.success) {
        setCurrentCase(result.data);
      } else {
        setError(result.error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start case");
    } finally {
      setIsLoading(false);
    }
  }, [caseId, playerId]);

  const restartCase = useCallback(async () => {
    if (!playerId) return;

    setIsLoading(true);
    setError(null);

    try {
      const engine = getCaseEngine();
      const result = await engine.restartCase(playerId);

      if (result.success) {
        setCurrentCase(result.data);
      } else {
        setError(result.error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restart case");
    } finally {
      setIsLoading(false);
    }
  }, [playerId]);

  const closeCase = useCallback(async () => {
    if (!playerId) return;

    try {
      const engine = getCaseEngine();
      await engine.closeCase(playerId);
      setCurrentCase(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to close case");
    }
  }, [playerId]);

  useEffect(() => {
    if (caseId && playerId) {
      const timer = setTimeout(() => {
        loadCase();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [caseId, playerId, loadCase]);

  return {
    currentCase,
    isLoading,
    error,
    loadCase,
    startCase,
    restartCase,
    closeCase,
  };
}
