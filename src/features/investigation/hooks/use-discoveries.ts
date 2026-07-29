"use client";

import { useCallback, useEffect, useState } from "react";
import { getInvestigationEngine } from "../services/investigation-engine-service";
import type { DiscoveryEntry, DiscoveryType } from "@/domain/engines/investigation/types";

export function useDiscoveries(playerId: string | null) {
  const [discoveries, setDiscoveries] = useState<DiscoveryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!playerId) return;

    setIsLoading(true);
    setError(null);

    try {
      const engine = getInvestigationEngine();
      const result = engine.getRecentDiscoveries(playerId, 50);

      if (result.success) {
        setDiscoveries(result.data);
      } else {
        setError(result.error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load discoveries");
    } finally {
      setIsLoading(false);
    }
  }, [playerId]);

  const discoverEvidence = useCallback(
    (
      evidenceId: string,
      options?: { locationId?: string; tags?: string[]; metadata?: Record<string, unknown> },
    ) => {
      if (!playerId) return null;

      const engine = getInvestigationEngine();
      const result = engine.collectEvidence(playerId, evidenceId, options);
      if (result.success) {
        refresh();
        return result.data;
      }
      setError(result.error.message);
      return null;
    },
    [playerId, refresh],
  );

  const makeObservation = useCallback(
    (
      observationId: string,
      options?: { locationId?: string; tags?: string[]; metadata?: Record<string, unknown> },
    ) => {
      if (!playerId) return null;

      const engine = getInvestigationEngine();
      const result = engine.makeObservation(playerId, observationId, options);
      if (result.success) {
        refresh();
        return result.data;
      }
      setError(result.error.message);
      return null;
    },
    [playerId, refresh],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    discoveries,
    isLoading,
    error,
    refresh,
    discoverEvidence,
    makeObservation,
  };
}
