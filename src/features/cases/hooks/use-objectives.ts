"use client";

import { useCallback, useEffect, useState } from "react";
import { getCaseEngine } from "../services/case-engine-service";
import type { Objective } from "@/domain/models/objective";
import type { ObjectiveState } from "@/domain/engines/case/types";

export function useObjectives(playerId: string | null) {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [objectiveStates, setObjectiveStates] = useState<ObjectiveState[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshObjectives = useCallback(() => {
    if (!playerId) return;

    const engine = getCaseEngine();
    const objResult = engine.getObjectives(playerId);
    if (objResult.success) {
      setObjectives(objResult.data);
    }

    const stateResult = engine.getObjectiveStates(playerId);
    if (stateResult.success) {
      setObjectiveStates(stateResult.data);
    }
  }, [playerId]);

  const completeObjective = useCallback(
    (objectiveId: string) => {
      if (!playerId) return false;

      const engine = getCaseEngine();
      const result = engine.completeObjective(playerId, objectiveId);
      if (result.success) {
        refreshObjectives();
        return true;
      }
      return false;
    },
    [playerId, refreshObjectives],
  );

  useEffect(() => {
    refreshObjectives();
  }, [playerId, refreshObjectives]);

  const activeObjectives = objectiveStates.filter((s) => s.isActive);
  const completedObjectives = objectiveStates.filter((s) => s.isCompleted);
  const hiddenObjectives = objectiveStates.filter((s) => !s.isRevealed);

  return {
    objectives,
    objectiveStates,
    activeObjectives,
    completedObjectives,
    hiddenObjectives,
    isLoading,
    refreshObjectives,
    completeObjective,
  };
}
