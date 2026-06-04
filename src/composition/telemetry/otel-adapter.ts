import {
  context,
  metrics,
  SpanStatusCode,
  trace,
  TraceFlags,
} from '@opentelemetry/api';
import { logs, SeverityNumber } from '@opentelemetry/api-logs';

import type {
  TelemetryAdapter,
  TelemetryAttributes,
  TelemetryCaptureContext,
  TelemetryLogLevel,
  TelemetrySpanHandle,
  TelemetrySpanOptions,
  TelemetryUser,
} from '@/platform/telemetry';
import { hashUserIdForMetrics } from '@/platform/telemetry/metadata';

const tracer = trace.getTracer('start-ui-web');
const meter = metrics.getMeter('start-ui-web');
const otelLogger = logs.getLogger('start-ui-web');

const counters = new Map<string, ReturnType<typeof meter.createCounter>>();
const histograms = new Map<string, ReturnType<typeof meter.createHistogram>>();

const severityByLevel = {
  debug: SeverityNumber.DEBUG,
  error: SeverityNumber.ERROR,
  info: SeverityNumber.INFO,
  warn: SeverityNumber.WARN,
} as const satisfies Record<TelemetryLogLevel, SeverityNumber>;

const captureSeverityByLevel = {
  debug: SeverityNumber.DEBUG,
  error: SeverityNumber.ERROR,
  fatal: SeverityNumber.FATAL,
  info: SeverityNumber.INFO,
  warning: SeverityNumber.WARN,
} as const satisfies Record<
  NonNullable<TelemetryCaptureContext['level']>,
  SeverityNumber
>;

const statusCodeByStatus = {
  error: SpanStatusCode.ERROR,
  ok: SpanStatusCode.OK,
  unset: SpanStatusCode.UNSET,
} as const;

const isPromiseLike = <T>(value: T): value is T & Promise<Awaited<T>> =>
  value !== null &&
  value !== undefined &&
  typeof value === 'object' &&
  'then' in value &&
  typeof (value as { then?: unknown }).then === 'function';

const toOtelException = (error: unknown) =>
  error instanceof Error ? error : String(error);

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const safeJson = (value: unknown) => {
  try {
    return JSON.stringify(value);
  } catch {
    return '[Unserializable]';
  }
};

const compactAttributes = (
  attributes: TelemetryAttributes | undefined
): Record<string, string | number | boolean> =>
  Object.fromEntries(
    Object.entries(attributes ?? {}).filter(
      (entry): entry is [string, string | number | boolean] =>
        entry[1] !== undefined
    )
  );

const metricAttributes = (
  attributes: TelemetryAttributes | undefined,
  user: TelemetryUser | null
) => ({
  ...compactAttributes(attributes),
  ...(hashUserIdForMetrics(user?.id)
    ? { 'user.id_hash': hashUserIdForMetrics(user?.id) }
    : {}),
});

const spanAttributes = (
  attributes: TelemetryAttributes | undefined,
  user: TelemetryUser | null
) => ({
  ...compactAttributes(attributes),
  ...(user?.id ? { 'user.id': user.id } : {}),
});

type ActiveSpanContext = {
  spanId?: string;
  traceId?: string;
};

const captureAttributes = (
  captureContext: TelemetryCaptureContext | undefined,
  spanContext: ActiveSpanContext | undefined,
  user: TelemetryUser | null
) => ({
  ...captureContext?.tags,
  ...(captureContext?.fingerprint
    ? { fingerprint: safeJson(captureContext.fingerprint) }
    : {}),
  ...(captureContext?.extra ? { extra: safeJson(captureContext.extra) } : {}),
  ...(spanContext?.spanId ? { 'span.id': spanContext.spanId } : {}),
  ...(spanContext?.traceId ? { 'trace.id': spanContext.traceId } : {}),
  ...(user?.id ? { 'user.id': user.id } : {}),
});

const getCounter = (name: string, unit: string | undefined) => {
  const key = `${name}:${unit ?? ''}`;
  const existing = counters.get(key);
  if (existing) return existing;

  const created = meter.createCounter(name, unit ? { unit } : {});
  counters.set(key, created);
  return created;
};

const getHistogram = (name: string, unit: string | undefined) => {
  const key = `${name}:${unit ?? ''}`;
  const existing = histograms.get(key);
  if (existing) return existing;

  const created = meter.createHistogram(name, unit ? { unit } : {});
  histograms.set(key, created);
  return created;
};

const manualSpanHandle = (
  span: ReturnType<typeof tracer.startSpan>,
  user: TelemetryUser | null
): TelemetrySpanHandle => ({
  addEvent: (name, attributes) => {
    span.addEvent(name, spanAttributes(attributes, user));
  },
  end: () => {
    span.end();
  },
  recordException: (error) => {
    span.recordException(toOtelException(error));
  },
  setAttributes: (attributes) => {
    span.setAttributes(spanAttributes(attributes, user));
  },
  setStatus: (status, message) => {
    span.setStatus({
      code: statusCodeByStatus[status],
      ...(message ? { message } : {}),
    });
  },
});

export const createOpenTelemetryAdapter = (): TelemetryAdapter => {
  let activeUser: TelemetryUser | null = null;

  return {
    captureException: (error, captureContext) => {
      const activeSpan = trace.getActiveSpan();
      const spanContext = activeSpan?.spanContext();
      const exception = toOtelException(error);
      const message = errorMessage(error);
      const level = captureContext?.level ?? 'error';

      activeSpan?.recordException(exception);
      activeSpan?.setStatus({
        code: SpanStatusCode.ERROR,
        ...(message ? { message } : {}),
      });

      otelLogger.emit({
        attributes: captureAttributes(captureContext, spanContext, activeUser),
        body: message,
        eventName:
          typeof captureContext?.tags?.event === 'string'
            ? captureContext.tags.event
            : 'exception.captured',
        exception,
        severityNumber: captureSeverityByLevel[level],
        severityText: level,
        context: context.active(),
      });
    },
    currentCorrelation: () => {
      const activeSpan = trace.getActiveSpan();
      const spanContext = activeSpan?.spanContext();
      if (!spanContext) return {};

      return {
        spanId: spanContext.spanId,
        traceId: spanContext.traceId,
        sampled: Boolean(spanContext.traceFlags & TraceFlags.SAMPLED),
      };
    },
    emitLog: (record) => {
      const correlation = trace.getActiveSpan()?.spanContext();
      otelLogger.emit({
        attributes: {
          ...compactAttributes(record.attributes),
          ...(record.direction ? { direction: record.direction } : {}),
          ...(record.error ? { error: record.error } : {}),
          ...(correlation?.spanId ? { 'span.id': correlation.spanId } : {}),
          ...(correlation?.traceId ? { 'trace.id': correlation.traceId } : {}),
          ...(activeUser?.id ? { 'user.id': activeUser.id } : {}),
          ...(record.details
            ? { details: JSON.stringify(record.details) }
            : {}),
        },
        body: record.message ?? record.event,
        eventName: record.event,
        exception: record.exception,
        severityNumber: severityByLevel[record.level],
        severityText: record.level,
        timestamp: record.timestamp,
        context: context.active(),
      });
    },
    recordMetric: (input) => {
      if (input.type === 'counter') {
        getCounter(input.name, input.unit).add(
          input.value,
          metricAttributes(input.attributes, activeUser)
        );
        return;
      }

      getHistogram(input.name, input.unit).record(
        input.value,
        metricAttributes(input.attributes, activeUser)
      );
    },
    setUser: (user) => {
      activeUser = user;
    },
    startManualSpan: (options) => {
      const span = tracer.startSpan(options.name, {
        attributes: spanAttributes(options.attributes, activeUser),
      });
      return manualSpanHandle(span, activeUser);
    },
    startSpan: (options: TelemetrySpanOptions, fn) =>
      tracer.startActiveSpan(
        options.name,
        { attributes: spanAttributes(options.attributes, activeUser) },
        (span) => {
          try {
            const result = fn();
            if (!isPromiseLike(result)) {
              span.setStatus({ code: SpanStatusCode.OK });
              span.end();
              return result;
            }

            return result
              .then((value) => {
                span.setStatus({ code: SpanStatusCode.OK });
                return value;
              })
              .catch((error: unknown) => {
                span.recordException(toOtelException(error));
                span.setStatus({
                  code: SpanStatusCode.ERROR,
                  message: error instanceof Error ? error.message : undefined,
                });
                throw error;
              })
              .finally(() => {
                span.end();
              }) as typeof result;
          } catch (error) {
            span.recordException(toOtelException(error));
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: error instanceof Error ? error.message : undefined,
            });
            span.end();
            throw error;
          }
        }
      ),
  };
};
