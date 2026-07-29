import { logger } from "@/lib/logger";

interface Breadcrumb {
  category: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

interface ErrorReport {
  error: Error;
  context?: Record<string, unknown>;
  severity: "low" | "medium" | "high" | "critical";
}

export class ErrorReportingService {
  private userId: string | null = null;
  private caseId: string | null = null;
  private breadcrumbs: Breadcrumb[] = [];
  private maxBreadcrumbs = 50;

  captureException(error: Error, context?: Record<string, unknown>): void {
    const report: ErrorReport = {
      error,
      context,
      severity: "medium",
    };

    logger.error(error.message, {
      ...context,
      stack: error.stack,
      severity: report.severity,
      userId: this.userId,
      caseId: this.caseId,
      breadcrumbs: this.breadcrumbs,
    });
  }

  captureMessage(message: string, level: "info" | "warning" | "error" = "error"): void {
    const meta: Record<string, unknown> = {
      userId: this.userId,
      caseId: this.caseId,
      breadcrumbs: this.breadcrumbs,
    };

    const logFn = level === "info" ? logger.info : level === "warning" ? logger.warn : logger.error;

    logFn(message, meta);
  }

  setUser(userId: string | null): void {
    this.userId = userId;
  }

  addBreadcrumb(category: string, message: string, data?: Record<string, unknown>): void {
    this.breadcrumbs.push({
      category,
      message,
      data,
      timestamp: new Date().toISOString(),
    });

    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }
  }

  setCaseContext(caseId: string | null): void {
    this.caseId = caseId;
  }
}

export const errorReportingService = new ErrorReportingService();
