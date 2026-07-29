import type { InvestigationContext, ActivityEntry } from "../types";
import { now } from "@/domain/value-objects/timestamp";
import { generateUuid } from "@/domain/utils/id-generator";
import { addActivity } from "../context/investigation-context";
import { sortByDateField } from "@/domain/utils/sorting";

export class ActivityTracker {
  trackAction(
    ctx: InvestigationContext,
    actionType: string,
    options?: {
      source?: string;
      targetId?: string | null;
      locationId?: string | null;
      metadata?: Record<string, unknown>;
      isUndoable?: boolean;
    },
  ): ActivityEntry {
    const entry: ActivityEntry = {
      id: generateUuid(),
      timestamp: now(),
      actionType,
      source: options?.source ?? "system",
      targetId: options?.targetId ?? null,
      locationId: options?.locationId ?? ctx.currentLocationId,
      metadata: options?.metadata ?? {},
      isUndoable: options?.isUndoable ?? false,
    };

    addActivity(ctx, entry);
    return entry;
  }

  getHistory(ctx: InvestigationContext): ActivityEntry[] {
    return [...ctx.activityHistory];
  }

  getRecentActions(ctx: InvestigationContext, limit: number = 10): ActivityEntry[] {
    return sortByDateField([...ctx.activityHistory], (a) => a.timestamp, "desc").slice(0, limit);
  }

  getActionsByType(ctx: InvestigationContext, actionType: string): ActivityEntry[] {
    return ctx.activityHistory.filter((a) => a.actionType === actionType);
  }

  getActionsByLocation(ctx: InvestigationContext, locationId: string): ActivityEntry[] {
    return ctx.activityHistory.filter((a) => a.locationId === locationId);
  }

  getActionsByTarget(ctx: InvestigationContext, targetId: string): ActivityEntry[] {
    return ctx.activityHistory.filter((a) => a.targetId === targetId);
  }

  getActionCount(ctx: InvestigationContext): number {
    return ctx.activityHistory.length;
  }

  getActionCountByType(ctx: InvestigationContext): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const action of ctx.activityHistory) {
      counts[action.actionType] = (counts[action.actionType] ?? 0) + 1;
    }
    return counts;
  }

  getActionTimeline(ctx: InvestigationContext): ActivityEntry[] {
    return sortByDateField([...ctx.activityHistory], (a) => a.timestamp, "asc");
  }

  getTimeBetweenActions(
    ctx: InvestigationContext,
    actionAId: string,
    actionBId: string,
  ): number | null {
    const actionA = ctx.activityHistory.find((a) => a.id === actionAId);
    const actionB = ctx.activityHistory.find((a) => a.id === actionBId);
    if (!actionA || !actionB) return null;
    return Math.abs(actionA.timestamp.differenceInSeconds(actionB.timestamp));
  }

  getLastAction(ctx: InvestigationContext): ActivityEntry | null {
    if (ctx.activityHistory.length === 0) return null;
    return ctx.activityHistory[ctx.activityHistory.length - 1] ?? null;
  }

  getLastActionOfType(ctx: InvestigationContext, actionType: string): ActivityEntry | null {
    for (let i = ctx.activityHistory.length - 1; i >= 0; i--) {
      const action = ctx.activityHistory[i];
      if (action && action.actionType === actionType) return action;
    }
    return null;
  }

  hasAction(ctx: InvestigationContext, actionType: string): boolean {
    return ctx.activityHistory.some((a) => a.actionType === actionType);
  }

  clearHistory(ctx: InvestigationContext): void {
    ctx.activityHistory = [];
    ctx.recentActions = [];
  }
}
