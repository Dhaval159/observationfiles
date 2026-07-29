"use client";

import { useCallback, useEffect, useState } from "react";
import { getInvestigationEngine } from "../services/investigation-engine-service";

export function useCurrentLocation(playerId: string | null) {
  const [locationId, setLocationId] = useState<string | null>(null);
  const [visitedLocations, setVisitedLocations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(() => {
    if (!playerId) return;
    setIsLoading(true);
    try {
      const engine = getInvestigationEngine();
      const result = engine.getContext(playerId);
      if (result.success) {
        setLocationId(result.data.currentLocationId);
        setVisitedLocations([...result.data.visitedLocationIds]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [playerId]);

  const moveTo = useCallback(
    (newLocationId: string) => {
      if (!playerId) return;
      const engine = getInvestigationEngine();
      const result = engine.moveToLocation(playerId, newLocationId);
      if (result.success) {
        setLocationId(result.data.currentLocationId);
        setVisitedLocations([...result.data.visitedLocationIds]);
      }
    },
    [playerId],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      refresh();
    }, 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  return { locationId, visitedLocations, isLoading, refresh, moveTo };
}
