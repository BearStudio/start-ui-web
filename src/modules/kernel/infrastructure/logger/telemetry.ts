import { sanitizeLogFields } from '@/platform/lib/redaction/sanitize-log-fields';

import type {
  LogFields,
  Logger,
  LogLevel,
} from '@/modules/kernel/application/ports/logger';
import {
  getLoggerConfig,
  type LoggerConfig,
} from '@/modules/kernel/infrastructure/config/logger';
import {
  type TelemetryAdapter,
  type TelemetryCaptureContext,
  toTelemetryStringTags,
} from '@/platform/telemetry';

export type LogRedactor = (
  fields: Record<string, unknown>
) => Record<string, unknown>;

type TelemetryLoggerInput = {
  telemetry: TelemetryAdapter;
  defaultFields?: Partial<LogFields>;
  redactor?: LogRedactor;
  level?: LoggerConfig['level'];
  consoleMirror?: boolean;
};

const CAPTURE_LEVEL_BY_LOG_LEVEL = {
  debug: 'debug',
  info: 'info',
  warn: 'warning',
  error: 'error',
} as const satisfies Record<LogLevel, TelemetryCaptureContext['level']>;

const LOG_LEVEL_RANK = {
  debug: 1,
  error: 4,
  info: 2,
  warn: 3,
} as const satisfies Record<LogLevel, number>;

const CONFIG_LEVEL_RANK = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  // The public Logger has no fatal method, so fatal is an error-only threshold.
  fatal: 4,
} as const satisfies Record<LoggerConfig['level'], number>;

const CONSOLE_METHOD_BY_LOG_LEVEL = {
  debug: 'debug',
  error: 'error',
  info: 'info',
  warn: 'warn',
} as const satisfies Record<LogLevel, keyof Pick<Console, LogLevel>>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const shouldEmitLog = (
  logLevel: LogLevel,
  configuredLevel: LoggerConfig['level']
) => LOG_LEVEL_RANK[logLevel] >= CONFIG_LEVEL_RANK[configuredLevel];

const serializeException = (
  exception: unknown,
  seen = new WeakSet<object>()
): unknown => {
  if (!exception || typeof exception !== 'object') {
    return exception;
  }

  if (seen.has(exception)) {
    return '[Circular]';
  }
  seen.add(exception);

  if (exception instanceof Error) {
    return {
      type: exception.name,
      message: exception.message,
      ...(exception.stack ? { stack: exception.stack } : {}),
      ...(exception.cause
        ? { cause: serializeException(exception.cause, seen) }
        : {}),
    };
  }

  return exception;
};

const prepareLogRecord = (fields: LogFields): Record<string, unknown> => {
  const rest = { ...fields } as Record<string, unknown>;
  delete rest.telemetryExtras;
  delete rest.telemetryTags;

  return {
    ...rest,
    ...(Object.hasOwn(rest, 'exception')
      ? { exception: serializeException(rest.exception) }
      : {}),
  };
};

const toSanitizedTagMap = (
  tags: Record<string, unknown>,
  redactor: LogRedactor
): Record<string, string> | undefined => {
  const sanitized = redactor({ tags }).tags;
  if (!isRecord(sanitized)) return undefined;

  return toTelemetryStringTags(sanitized);
};

const toSanitizedExtras = (
  extras: Record<string, unknown> | undefined,
  redactor: LogRedactor
): Record<string, unknown> => (extras ? redactor(extras) : {});

const buildTelemetryCaptureContext = ({
  fields,
  level,
  redactor,
  sanitizedLogRecord,
}: {
  fields: LogFields;
  level: LogLevel;
  redactor: LogRedactor;
  sanitizedLogRecord: Record<string, unknown>;
}): TelemetryCaptureContext => {
  const tagCandidates: Record<string, unknown> = {
    ...fields.telemetryTags,
    event: fields.event,
    ...(fields.requestId ? { requestId: fields.requestId } : {}),
    ...(fields.correlationId ? { correlationId: fields.correlationId } : {}),
  };
  const tags = toSanitizedTagMap(tagCandidates, redactor);
  const telemetryExtras = toSanitizedExtras(fields.telemetryExtras, redactor);

  return {
    ...(tags ? { tags } : {}),
    extra: {
      ...telemetryExtras,
      log: sanitizedLogRecord,
    },
    level: CAPTURE_LEVEL_BY_LOG_LEVEL[level],
  };
};

const writeConsoleMirror = ({
  level,
  message,
  sanitizedLogRecord,
}: {
  level: LogLevel;
  message: string;
  sanitizedLogRecord: Record<string, unknown>;
}) => {
  const consoleLike = globalThis.console;
  const method = consoleLike?.[CONSOLE_METHOD_BY_LOG_LEVEL[level]];
  if (typeof method !== 'function') return;

  method.call(consoleLike, message, {
    level,
    ...sanitizedLogRecord,
  });
};

export function createTelemetryLogger({
  telemetry,
  defaultFields,
  redactor = sanitizeLogFields,
  level,
  consoleMirror,
}: TelemetryLoggerInput): Logger {
  const config = getLoggerConfig();
  const configuredLevel = level ?? config.level;
  const shouldMirrorToConsole = consoleMirror ?? config.consoleMirror;

  const write = (logLevel: LogLevel, fields: LogFields) => {
    const correlation = telemetry.currentCorrelation();
    const mergedFields = {
      ...defaultFields,
      ...fields,
      ...(correlation.traceId ? { traceId: correlation.traceId } : {}),
      ...(correlation.spanId ? { spanId: correlation.spanId } : {}),
    };
    const logRecord = prepareLogRecord(mergedFields);
    const sanitizedLogRecord = redactor(logRecord);
    const message =
      typeof sanitizedLogRecord.event === 'string'
        ? sanitizedLogRecord.event
        : fields.event;
    const shouldEmit = shouldEmitLog(logLevel, configuredLevel);
    const shouldCaptureException =
      logLevel === 'error' && Object.hasOwn(mergedFields, 'exception');

    if (shouldEmit && shouldMirrorToConsole) {
      writeConsoleMirror({
        level: logLevel,
        message,
        sanitizedLogRecord,
      });
    }

    if (shouldEmit) {
      telemetry.emitLog({
        attributes: {
          ...(mergedFields.correlationId
            ? { correlationId: mergedFields.correlationId }
            : {}),
          ...(mergedFields.requestId
            ? { requestId: mergedFields.requestId }
            : {}),
          ...(mergedFields.scopeKey ? { scopeKey: mergedFields.scopeKey } : {}),
          ...(mergedFields.sessionId
            ? { sessionId: mergedFields.sessionId }
            : {}),
          ...(mergedFields.spanId ? { spanId: mergedFields.spanId } : {}),
          ...(mergedFields.traceId ? { traceId: mergedFields.traceId } : {}),
          ...(mergedFields.userId ? { userId: mergedFields.userId } : {}),
        },
        details:
          sanitizedLogRecord.details &&
          typeof sanitizedLogRecord.details === 'object' &&
          !Array.isArray(sanitizedLogRecord.details)
            ? (sanitizedLogRecord.details as Record<string, unknown>)
            : undefined,
        direction: mergedFields.direction,
        error:
          typeof sanitizedLogRecord.error === 'string'
            ? sanitizedLogRecord.error
            : undefined,
        event: message,
        level: logLevel,
        message,
        ...(!shouldCaptureException && Object.hasOwn(mergedFields, 'exception')
          ? { exception: mergedFields.exception }
          : {}),
      });
    }

    if (shouldCaptureException) {
      telemetry.captureException(
        mergedFields.exception,
        buildTelemetryCaptureContext({
          fields: mergedFields,
          level: logLevel,
          redactor,
          sanitizedLogRecord,
        })
      );
    }
  };

  return {
    debug: (fields) => write('debug', fields),
    info: (fields) => write('info', fields),
    warn: (fields) => write('warn', fields),
    error: (fields) => write('error', fields),
  };
}
