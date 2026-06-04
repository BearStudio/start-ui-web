import type {
  CorrelationId,
  RequestId,
  ScopeKey,
  SessionId,
  UserId,
} from '@/modules/kernel/domain/ids';

export type LogDirection = 'inbound' | 'outbound' | 'internal';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogTagValue = string | number | boolean;

export interface LogFields {
  event: string;
  direction?: LogDirection;

  requestId?: RequestId;
  correlationId?: CorrelationId;

  userId?: UserId;
  sessionId?: SessionId;
  scopeKey?: ScopeKey;

  error?: string;
  exception?: unknown;
  spanId?: string;
  traceId?: string;

  details?: Record<string, unknown>;
  durationMs?: number;

  telemetryTags?: Record<string, LogTagValue>;
  telemetryExtras?: Record<string, unknown>;
}

export interface Logger {
  debug(fields: LogFields): void;
  info(fields: LogFields): void;
  warn(fields: LogFields): void;
  error(fields: LogFields): void;
}

export type RequestLoggerInput = {
  logger: Logger;
  requestId: RequestId;
  userId?: UserId;
  sessionId?: SessionId;
  scopeKey?: ScopeKey;
};

export const createRequestLogger = ({
  logger,
  requestId,
  userId,
  sessionId,
  scopeKey,
}: RequestLoggerInput): Logger => {
  const defaults = {
    requestId,
    ...(userId ? { userId } : {}),
    ...(sessionId ? { sessionId } : {}),
    ...(scopeKey ? { scopeKey } : {}),
  } satisfies Partial<LogFields>;

  const withDefaults = (fields: LogFields): LogFields => ({
    ...fields,
    ...defaults,
  });

  return {
    debug: (fields) => logger.debug(withDefaults(fields)),
    info: (fields) => logger.info(withDefaults(fields)),
    warn: (fields) => logger.warn(withDefaults(fields)),
    error: (fields) => logger.error(withDefaults(fields)),
  };
};
