import { logger as baseLogger } from "@/lib/logger";

export { baseLogger as logger };

export function createScopedLogger(scope: string) {
  const prefix = (msg: string) => `[${scope}] ${msg}`;

  return {
    debug(message: string, meta?: Record<string, unknown>): void {
      baseLogger.debug(prefix(message), meta);
    },

    info(message: string, meta?: Record<string, unknown>): void {
      baseLogger.info(prefix(message), meta);
    },

    warn(message: string, meta?: Record<string, unknown>): void {
      baseLogger.warn(prefix(message), meta);
    },

    error(message: string, meta?: Record<string, unknown>): void {
      baseLogger.error(prefix(message), meta);
    },
  };
}
