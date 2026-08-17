type LogLevel = "info" | "warn" | "error" | "debug";

type LogContext = Record<string, unknown>;

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordHash",
  "token",
  "accessToken",
  "accesstoken",
  "refreshToken",
  "refreshtoken",
  "authorization",
  "jwt",
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeValue(value: unknown, key?: string): unknown {
  if (key && SENSITIVE_KEYS.has(key.toLowerCase())) {
    return "[REDACTED]";
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [
        entryKey,
        sanitizeValue(entryValue, entryKey),
      ]),
    );
  }

  return value;
}

function emit(level: LogLevel, message: string, context: LogContext = {}): void {
  const sanitizedContext = sanitizeValue(context) as Record<string, unknown>;
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...sanitizedContext,
  };

  const serialized = JSON.stringify(payload);

  if (level === "error") {
    console.error(serialized);
    return;
  }

  console.log(serialized);
}

export const logger = {
  info(message: string, context?: LogContext): void {
    emit("info", message, context);
  },
  warn(message: string, context?: LogContext): void {
    emit("warn", message, context);
  },
  error(message: string, context?: LogContext): void {
    emit("error", message, context);
  },
  debug(message: string, context?: LogContext): void {
    emit("debug", message, context);
  },
  sanitizeValue,
};
