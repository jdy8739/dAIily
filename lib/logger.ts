import pino from "pino";
import { env } from "./env";

/**
 * Structured logger with automatic sensitive data redaction
 *
 * @remarks
 * - Production: JSON logs (level: info)
 * - Development: Pretty-printed with colors (level: debug)
 * - Auto-redacts: password, token, apiKey, secret fields
 *
 * @example
 * ```typescript
 * logger.info({ userId: "123" }, "User logged in");
 * logger.error({ err: error }, "Failed to process request");
 * ```
 */
const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  transport:
    env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            ignore: "pid,hostname",
            translateTime: "HH:MM:ss",
            sync: true, // Use sync mode to avoid worker thread issues
          },
        }
      : undefined,
  formatters: {
    level: label => {
      return { level: label };
    },
  },
  redact: {
    paths: [
      "password",
      "*.password",
      "token",
      "*.token",
      "apiKey",
      "*.apiKey",
      "secret",
      "*.secret",
    ],
    remove: true,
  },
});

export { logger };
