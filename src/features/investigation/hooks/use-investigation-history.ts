"use client";

import { useCallback, useEffect, useState } from "react";
import { getInvestigationEngine } from "../services/investigation-engine-service";
import type { ActivityEntry, LogEntry, InvestigationNotification } from "@/domain/engines/investigation/types";

export function useInvestigationHistory(playerId: string | null) {
  const [history, setHistory] = useState<ActivityEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(() => {
    if (!playerId) return;
    setIsLoading(true);
    try {
      const engine = getInvestigationEngine();
      const result = engine.getActivityHistory(playerId);
      if (result.success) {
        setHistory(result.data as ActivityEntry[]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { history, isLoading, refresh };
}

export function useInvestigationLog(playerId: string | null) {
  const [log, setLog] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(() => {
    if (!playerId) return;
    setIsLoading(true);
    try {
      const engine = getInvestigationEngine();
      const result = engine.getContext(playerId);
      if (result.success) {
        setLog(result.data.investigationLog);
      }
    } finally {
      setIsLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { log, isLoading, refresh };
}

export function useNotifications(playerId: string | null) {
  const [notifications, setNotifications] = useState<InvestigationNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(() => {
    if (!playerId) return;
    setIsLoading(true);
    try {
      const engine = getInvestigationEngine();
      const ctxResult = engine.getContext(playerId);
      if (ctxResult.success) {
        setNotifications(ctxResult.data.notificationQueue);
      }
      const countResult = engine.getUnreadNotificationCount(playerId);
      if (countResult.success) {
        setUnreadCount(countResult.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { notifications, unreadCount, isLoading, refresh };
}
