import { logger } from "@/lib/logger";

export interface ErrorReport {
  error: Error;
  context?: Record<string, unknown>;
  tags?: string[];
  severity: "low" | "medium" | "high" | "critical";
}

export const errorReporting = {
  capture(error: Error, context?: Record<string, unknown>): void {
    const report: ErrorReport = {
      error,
      context,
      severity: "medium",
    };

    logger.error(error.message, { ...context, stack: error.stack, severity: report.severity });
  },

  captureMessage(message: string, context?: Record<string, unknown>): void {
    logger.error(message, context);
  },
};
