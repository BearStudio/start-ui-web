import { sanitizeLogFields } from '@/platform/lib/redaction/sanitize-log-fields';

import { getTelemetry } from './runtime';
import type { TelemetryLogLevel } from './types';

const TELEMETRY_LOG_ENDPOINT = '/api/telemetry/logs';
const MAX_BATCH_SIZE = 20;
const FLUSH_DELAY_MS = 2_000;

export type FrontendLogPayload = {
  level: TelemetryLogLevel;
  event: string;
  message?: string;
  details?: Record<string, unknown>;
  error?: string;
  traceId?: string;
  spanId?: string;
  timestamp: string;
};

type FrontendLoggerInput = {
  message?: string;
  details?: Record<string, unknown>;
  error?: unknown;
};

let queue: FrontendLogPayload[] = [];
let flushTimer: ReturnType<typeof setTimeout> | undefined;
let listenersRegistered = false;

const isBrowser = () => typeof window !== 'undefined';

const errorMessage = (error: unknown): string | undefined => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return undefined;
};

const serializeLogInput = (
  level: TelemetryLogLevel,
  event: string,
  input: FrontendLoggerInput = {}
): FrontendLogPayload => {
  const correlation = getTelemetry().currentCorrelation();
  const sanitized = sanitizeLogFields({
    details: input.details ?? {},
    error: errorMessage(input.error),
    message: input.message,
  });

  return {
    level,
    event,
    ...(typeof sanitized.message === 'string'
      ? { message: sanitized.message }
      : {}),
    ...(sanitized.details &&
    typeof sanitized.details === 'object' &&
    !Array.isArray(sanitized.details)
      ? { details: sanitized.details as Record<string, unknown> }
      : {}),
    ...(typeof sanitized.error === 'string' ? { error: sanitized.error } : {}),
    ...(correlation.traceId ? { traceId: correlation.traceId } : {}),
    ...(correlation.spanId ? { spanId: correlation.spanId } : {}),
    timestamp: new Date().toISOString(),
  };
};

const clearFlushTimer = () => {
  if (!flushTimer) return;
  clearTimeout(flushTimer);
  flushTimer = undefined;
};

const sendWithBeacon = (records: FrontendLogPayload[]) => {
  if (!navigator.sendBeacon) return false;

  const body = new Blob([JSON.stringify({ records })], {
    type: 'application/json',
  });
  return navigator.sendBeacon(TELEMETRY_LOG_ENDPOINT, body);
};

const sendWithFetch = async (records: FrontendLogPayload[]) => {
  const response = await fetch(TELEMETRY_LOG_ENDPOINT, {
    body: JSON.stringify({ records }),
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Failed to send frontend logs: ${response.status}`);
  }
};

export const flushFrontendLogs = async () => {
  if (!isBrowser() || queue.length === 0) return;

  clearFlushTimer();
  const records = queue;
  queue = [];

  if (sendWithBeacon(records)) return;

  try {
    await sendWithFetch(records);
  } catch {
    queue = [...records, ...queue].slice(-MAX_BATCH_SIZE * 5);
  }
};

const scheduleFlush = () => {
  if (flushTimer || !isBrowser()) return;
  flushTimer = setTimeout(() => {
    void flushFrontendLogs();
  }, FLUSH_DELAY_MS);
};

const registerLifecycleFlush = () => {
  if (!isBrowser() || listenersRegistered) return;
  listenersRegistered = true;

  window.addEventListener('pagehide', () => {
    void flushFrontendLogs();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      void flushFrontendLogs();
    }
  });
};

const enqueueFrontendLog = (
  level: TelemetryLogLevel,
  event: string,
  input?: FrontendLoggerInput
) => {
  if (!isBrowser()) return;

  registerLifecycleFlush();
  queue.push(serializeLogInput(level, event, input));

  if (queue.length >= MAX_BATCH_SIZE) {
    void flushFrontendLogs();
    return;
  }

  scheduleFlush();
};

export const frontendLogger = {
  debug: (event: string, input?: FrontendLoggerInput) =>
    enqueueFrontendLog('debug', event, input),
  error: (event: string, input?: FrontendLoggerInput) =>
    enqueueFrontendLog('error', event, input),
  info: (event: string, input?: FrontendLoggerInput) =>
    enqueueFrontendLog('info', event, input),
  warn: (event: string, input?: FrontendLoggerInput) =>
    enqueueFrontendLog('warn', event, input),
};
