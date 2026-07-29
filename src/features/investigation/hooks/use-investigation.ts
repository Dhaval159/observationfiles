"use client";

import { useCallback, useEffect, useState } from "react";
import { getInvestigationEngine } from "../services/investigation-engine-service";
import { useEngineInvestigationStore, type InvestigationEngineLifecycleState } from "@/stores/engine-investigation-store";
import type { InvestigationContext } from "@/domain/engines/investigation/types";

export function useInvestigation(playerId: string | null) {
  const [lifecycleState, setLocalLifecycleState] = useState<string>("not_started");
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<InvestigationContext | null>(null);

  const storeState = useEngineInvestigationStore.getState().lifecycleState;

  const refreshState = useCallback(() => {
    if (!playerId) return;

    const engine = getInvestigationEngine();
    const stateResult = engine.getContext(playerId);
    if (stateResult.success) {
      setLocalLifecycleState(stateResult.data.lifecycleState);
      setContext(stateResult.data);
    }

    setIsActive(engine.isInvestigationActive(playerId));
  }, [playerId]);

  const startInvestigation = useCallback(
    async (caseId: string) => {
      if (!playerId) return;
      setIsLoading(true);
      try {
        const engine = getInvestigationEngine();
        const result = await engine.startInvestigation(caseId, playerId);
        if (result.success) {
          setContext(result.data);
          setLocalLifecycleState(result.data.lifecycleState);
          setIsActive(true);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [playerId],
  );

  const pause = useCallback(async () => {
    if (!playerId) return;
    setIsLoading(true);
    try {
      const engine = getInvestigationEngine();
      const result = engine.pauseInvestigation(playerId);
      if (result.success) {
        refreshState();
      }
    } finally {
      setIsLoading(false);
    }
  }, [playerId, refreshState]);

  const resume = useCallback(async () => {
    if (!playerId) return;
    setIsLoading(true);
    try {
      const engine = getInvestigationEngine();
      const result = engine.resumeInvestigation(playerId);
      if (result.success) {
        refreshState();
      }
    } finally {
      setIsLoading(false);
    }
  }, [playerId, refreshState]);

  const complete = useCallback(async () => {
    if (!playerId) return;
    setIsLoading(true);
    try {
      const engine = getInvestigationEngine();
      const result = engine.completeInvestigation(playerId);
      if (result.success) {
        refreshState();
      }
    } finally {
      setIsLoading(false);
    }
  }, [playerId, refreshState]);

  useEffect(() => {
    refreshState();
  }, [playerId, refreshState]);

  return {
    lifecycleState: lifecycleState as InvestigationEngineLifecycleState,
    isActive,
    isLoading,
    context,
    refreshState,
    startInvestigation,
    pause,
    resume,
    complete,
  };
}
