import type { InvestigationContext, InvestigationNotification, NotificationCategory } from "../types";
import type { EventBus } from "@/domain/events/base-event";
import { now } from "@/domain/value-objects/timestamp";
import { generateUuid } from "@/domain/utils/id-generator";
import { addNotification, markNotificationRead, clearNotifications, touchContext } from "../context/investigation-context";

export class NotificationCoordinator {
  private _eventBus: EventBus | null = null;
  private _maxQueueSize: number = 100;

  setEventBus(eventBus: EventBus): void {
    this._eventBus = eventBus;
  }

  setMaxQueueSize(size: number): void {
    this._maxQueueSize = size;
  }

  notify(
    ctx: InvestigationContext,
    options: {
      type: NotificationCategory;
      priority?: number;
      title: string;
      message: string;
      actionUrl?: string | null;
      metadata?: Record<string, unknown>;
      expiresInSeconds?: number;
    },
  ): InvestigationNotification {
    const notification: InvestigationNotification = {
      id: generateUuid(),
      type: options.type,
      priority: options.priority ?? 3,
      title: options.title,
      message: options.message,
      timestamp: now(),
      isRead: false,
      actionUrl: options.actionUrl ?? null,
      metadata: options.metadata ?? {},
      expiresAt: options.expiresInSeconds
        ? now().addSeconds(options.expiresInSeconds)
        : null,
    };

    addNotification(ctx, notification);

    if (ctx.notificationQueue.length > this._maxQueueSize) {
      ctx.notificationQueue = ctx.notificationQueue.slice(-this._maxQueueSize);
    }

    if (this._eventBus) {
      this._eventBus.publish({
        id: `NOTIFY_${notification.id}`,
        type: "notification_created",
        source: "NotificationCoordinator",
        timestamp: notification.timestamp,
        metadata: {
          notificationId: notification.id,
          category: notification.type,
          priority: notification.priority,
          playerId: ctx.playerId,
          caseId: ctx.caseId,
        },
      }).catch(() => {});
    }

    return notification;
  }

  notifyObjectiveUpdate(ctx: InvestigationContext, objectiveId: string, status: string): void {
    this.notify(ctx, {
      type: "objective_update",
      priority: 2,
      title: "Objective Update",
      message: `Objective ${objectiveId}: ${status}`,
      metadata: { objectiveId, status },
    });
  }

  notifyUnlock(ctx: InvestigationContext, systemName: string): void {
    this.notify(ctx, {
      type: "unlock",
      priority: 3,
      title: "New System Unlocked",
      message: `${systemName} is now available`,
      metadata: { systemName },
    });
  }

  notifyDiscovery(ctx: InvestigationContext, discoveryName: string): void {
    this.notify(ctx, {
      type: "discovery",
      priority: 2,
      title: "New Discovery",
      message: `Discovered: ${discoveryName}`,
      metadata: { discoveryName },
    });
  }

  notifyAchievement(ctx: InvestigationContext, achievementTitle: string, xpReward: number): void {
    this.notify(ctx, {
      type: "achievement",
      priority: 4,
      title: "Achievement Unlocked",
      message: `${achievementTitle} (+${xpReward} XP)`,
      metadata: { achievementTitle, xpReward },
    });
  }

  notifyProgress(ctx: InvestigationContext, percentage: number): void {
    this.notify(ctx, {
      type: "progress",
      priority: 1,
      title: "Progress Update",
      message: `Investigation is ${percentage}% complete`,
      metadata: { percentage },
    });
  }

  notifyError(ctx: InvestigationContext, message: string): void {
    this.notify(ctx, {
      type: "error",
      priority: 5,
      title: "Error",
      message,
      metadata: { errorMessage: message },
    });
  }

  notifyWarning(ctx: InvestigationContext, message: string): void {
    this.notify(ctx, {
      type: "warning",
      priority: 4,
      title: "Warning",
      message,
      metadata: { warningMessage: message },
    });
  }

  notifyHint(ctx: InvestigationContext, hintContent: string): void {
    this.notify(ctx, {
      type: "hint",
      priority: 2,
      title: "Hint Available",
      message: hintContent,
      metadata: { hintContent },
    });
  }

  notifySystem(ctx: InvestigationContext, message: string): void {
    this.notify(ctx, {
      type: "system",
      priority: 1,
      title: "System",
      message,
    });
  }

  notifyDialogue(ctx: InvestigationContext, npcName: string): void {
    this.notify(ctx, {
      type: "dialogue",
      priority: 2,
      title: "New Dialogue",
      message: `${npcName} has new dialogue available`,
      metadata: { npcName },
    });
  }

  getNotifications(ctx: InvestigationContext): InvestigationNotification[] {
    return [...ctx.notificationQueue];
  }

  getUnreadNotifications(ctx: InvestigationContext): InvestigationNotification[] {
    return ctx.notificationQueue.filter((n) => !n.isRead);
  }

  getUnreadCount(ctx: InvestigationContext): number {
    return ctx.notificationQueue.filter((n) => !n.isRead).length;
  }

  getNotificationsByType(ctx: InvestigationContext, type: NotificationCategory): InvestigationNotification[] {
    return ctx.notificationQueue.filter((n) => n.type === type);
  }

  markAsRead(ctx: InvestigationContext, notificationId: string): void {
    markNotificationRead(ctx, notificationId);
  }

  markAllAsRead(ctx: InvestigationContext): void {
    for (const notification of ctx.notificationQueue) {
      (notification as { isRead: boolean }).isRead = true;
    }
    touchContext(ctx);
  }

  clearAll(ctx: InvestigationContext): void {
    clearNotifications(ctx);
  }

  clearByType(ctx: InvestigationContext, type: NotificationCategory): void {
    ctx.notificationQueue = ctx.notificationQueue.filter((n) => n.type !== type);
    touchContext(ctx);
  }

  getRecent(ctx: InvestigationContext, limit: number = 10): InvestigationNotification[] {
    return [...ctx.notificationQueue]
      .sort((a, b) => b.timestamp.unix - a.timestamp.unix)
      .slice(0, limit);
  }
}
