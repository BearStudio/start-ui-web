import { black, blue, cyan, gray, green, magenta, red } from 'colorette';
import pino from 'pino';
import pretty from 'pino-pretty';
import { z } from 'zod';

import { sanitizeLogFields } from '@/platform/lib/redaction/sanitize-log-fields';

import type {
  LogFields,
  Logger,
  LogLevel,
} from '@/modules/kernel/application/ports/logger';
import { getLoggerConfig } from '@/modules/kernel/infrastructure/config/logger';
import {
  type TelemetryAdapter,
  type TelemetryCaptureContext,
  toTelemetryStringTags,
} from '@/platform/telemetry';

export type LogRedactor = (
  fields: Record<string, unknown>
) => Record<string, unknown>;

export function createPinoLogger(options?: pino.LoggerOptions) {
  const loggerConfig = getLoggerConfig();
  const loggerOptions: pino.LoggerOptions = {
    level: loggerConfig.level,
    ...options,
  };

  return loggerConfig.pretty
    ? pino(
        loggerOptions,
        pretty({
          ignore:
            'event,scope,type,path,pid,hostname,requestId,correlationId,sessionId,scopeKey,durationMs,userId,errorCode,errorMessage',
          messageFormat: (log, messageKey) => {
            const {
              requestId,
              scope,
              type,
              path,
              durationMs,
              message,
              userId,
              errorCode,
              errorMessage,
            } = z
              .object({
                requestId: z
                  .string()
                  .optional()
                  .catch(undefined)
                  .transform((v) => (v ? `${gray(v)} - ` : '')),
                userId: z
                  .string()
                  .optional()
                  .catch(undefined)
                  .transform((v) =>
                    v ? `👤 ${cyan(v)} - ` : magenta('🕶️  Anonymous ')
                  ),
                scope: z
                  .string()
                  .optional()
                  .catch(undefined)
                  .transform((v) => (v ? gray(`(${v})`) : '')),
                type: z
                  .string()
                  .optional()
                  .catch(undefined)
                  .transform((v) =>
                    v ? `${green(v.toLocaleUpperCase())} on ` : ''
                  ),
                path: z
                  .string()
                  .optional()
                  .catch(undefined)
                  .transform((v) => (v ? `${blue(v)} ` : '')),
                durationMs: z
                  .number()
                  .optional()
                  .catch(undefined)
                  .transform((v) => (v ? gray(`(took ${v}ms) `) : '')),
                message: z
                  .string()
                  .optional()
                  .catch(undefined)
                  .transform((v) => (v ? black(`${v} `) : '')),
                errorCode: z
                  .string()
                  .optional()
                  .catch(undefined)
                  .transform((v) => (v ? red(`[${v}] `) : '')),
                errorMessage: z
                  .string()
                  .optional()
                  .catch(undefined)
                  .transform((v) => (v ? black(`${v} `) : '')),
              })
              .parse({ ...log, message: log[messageKey] });

            const error =
              errorCode || errorMessage ? `· ${errorCode}${errorMessage}` : '';

            return black(
              `${userId}${requestId}${type}${path}· ${message}${error}${scope}${durationMs}`
            );
          },
        })
      )
    : pino(loggerOptions);
}

export type PinoLogger = ReturnType<typeof createPinoLogger>;

type PinoAppLoggerInput = {
  pino: Pick<PinoLogger, 'debug' | 'info' | 'warn' | 'error'>;
  telemetry: TelemetryAdapter;
  defaultFields?: Partial<LogFields>;
  redactor?: LogRedactor;
};

const SENTRY_LEVEL_BY_LOG_LEVEL = {
  debug: 'debug',
  info: 'info',
  warn: 'warning',
  error: 'error',
} as const satisfies Record<LogLevel, TelemetryCaptureContext['level']>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

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
  delete rest.sentryExtras;
  delete rest.sentryTags;

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
    ...fields.sentryTags,
    event: fields.event,
    ...(fields.requestId ? { requestId: fields.requestId } : {}),
    ...(fields.correlationId ? { correlationId: fields.correlationId } : {}),
  };
  const tags = toSanitizedTagMap(tagCandidates, redactor);
  const sentryExtras = toSanitizedExtras(fields.sentryExtras, redactor);

  return {
    ...(tags ? { tags } : {}),
    extra: {
      ...sentryExtras,
      log: sanitizedLogRecord,
    },
    level: SENTRY_LEVEL_BY_LOG_LEVEL[level],
  };
};

export function createPinoAppLogger({
  pino,
  telemetry,
  defaultFields,
  redactor = sanitizeLogFields,
}: PinoAppLoggerInput): Logger {
  const write = (level: LogLevel, fields: LogFields) => {
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

    pino[level](sanitizedLogRecord, message);
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
      exception: mergedFields.exception,
      level,
      message,
    });

    if (level === 'error' && Object.hasOwn(mergedFields, 'exception')) {
      telemetry.captureException(
        mergedFields.exception,
        buildTelemetryCaptureContext({
          fields: mergedFields,
          level,
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

let defaultLogger: PinoLogger | undefined;

export function getDefaultPinoLogger() {
  defaultLogger ??= createPinoLogger();
  return defaultLogger;
}

export const logger = new Proxy({} as PinoLogger, {
  get(_target, prop) {
    const instance = getDefaultPinoLogger();
    const value = Reflect.get(instance, prop, instance);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
