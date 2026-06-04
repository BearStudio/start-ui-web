import { beforeEach, describe, expect, it, vi } from 'vitest';

const otelMocks = vi.hoisted(() => {
  const state = {
    activeSpan: undefined as
      | {
          recordException: ReturnType<typeof vi.fn>;
          setStatus: ReturnType<typeof vi.fn>;
          spanContext: ReturnType<typeof vi.fn>;
        }
      | undefined,
    startedSpan: undefined as
      | {
          end: ReturnType<typeof vi.fn>;
          recordException: ReturnType<typeof vi.fn>;
          setStatus: ReturnType<typeof vi.fn>;
          spanContext: ReturnType<typeof vi.fn>;
        }
      | undefined,
  };

  return {
    activeContext: { trace: 'active-context' },
    emit: vi.fn(),
    getActiveSpan: vi.fn(() => state.activeSpan),
    state,
  };
});

vi.mock('@opentelemetry/api', () => ({
  context: {
    active: vi.fn(() => otelMocks.activeContext),
  },
  metrics: {
    getMeter: vi.fn(() => ({
      createCounter: vi.fn(() => ({ add: vi.fn() })),
      createHistogram: vi.fn(() => ({ record: vi.fn() })),
    })),
  },
  SpanStatusCode: {
    ERROR: 'ERROR',
    OK: 'OK',
    UNSET: 'UNSET',
  },
  trace: {
    getActiveSpan: otelMocks.getActiveSpan,
    getTracer: vi.fn(() => ({
      startActiveSpan: vi.fn((_name, _options, fn) => {
        const span = {
          end: vi.fn(),
          recordException: vi.fn(),
          setStatus: vi.fn(),
          spanContext: vi.fn(() => ({
            spanId: 'started-span',
            traceFlags: 1,
            traceId: 'started-trace',
          })),
        };
        otelMocks.state.startedSpan = span;
        return fn(span);
      }),
      startSpan: vi.fn(() => ({
        addEvent: vi.fn(),
        end: vi.fn(),
        recordException: vi.fn(),
        setAttributes: vi.fn(),
        setStatus: vi.fn(),
      })),
    })),
  },
  TraceFlags: {
    SAMPLED: 1,
  },
}));

vi.mock('@opentelemetry/api-logs', () => ({
  logs: {
    getLogger: vi.fn(() => ({
      emit: otelMocks.emit,
    })),
  },
  SeverityNumber: {
    DEBUG: 5,
    ERROR: 17,
    FATAL: 21,
    INFO: 9,
    WARN: 13,
  },
}));

describe('createOpenTelemetryAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    otelMocks.state.activeSpan = undefined;
    otelMocks.state.startedSpan = undefined;
  });

  it('records captured exceptions on the active span and emits an OTel log event', async () => {
    const activeSpan = {
      recordException: vi.fn(),
      setStatus: vi.fn(),
      spanContext: vi.fn(() => ({
        spanId: 'span-1',
        traceId: 'trace-1',
      })),
    };
    otelMocks.state.activeSpan = activeSpan;
    const { createOpenTelemetryAdapter } =
      await import('@/composition/telemetry/otel-adapter');
    const adapter = createOpenTelemetryAdapter();
    adapter.setUser({ id: 'user-1' });
    const error = new Error('provider failed');

    adapter.captureException(error, {
      extra: { statusCode: 500 },
      fingerprint: ['auth'],
      level: 'warning',
      tags: { event: 'auth.failure', provider: 'better-auth' },
    });

    expect(activeSpan.recordException).toHaveBeenCalledWith(error);
    expect(activeSpan.setStatus).not.toHaveBeenCalled();
    expect(otelMocks.emit).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.objectContaining({
          event: 'auth.failure',
          extra: JSON.stringify({ statusCode: 500 }),
          fingerprint: JSON.stringify(['auth']),
          provider: 'better-auth',
          'span.id': 'span-1',
          'trace.id': 'trace-1',
          'user.id': 'user-1',
        }),
        body: 'provider failed',
        context: otelMocks.activeContext,
        eventName: 'auth.failure',
        exception: error,
        severityNumber: 13,
        severityText: 'WARN',
      })
    );
  });

  it('normalizes structured log severity text to OTel labels', async () => {
    const { createOpenTelemetryAdapter } =
      await import('@/composition/telemetry/otel-adapter');
    const adapter = createOpenTelemetryAdapter();

    adapter.emitLog({ event: 'quota.near_limit', level: 'warn' });

    expect(otelMocks.emit).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'quota.near_limit',
        severityNumber: 13,
        severityText: 'WARN',
      })
    );
  });

  it('uses message properties from plain captured error objects', async () => {
    const { createOpenTelemetryAdapter } =
      await import('@/composition/telemetry/otel-adapter');
    const adapter = createOpenTelemetryAdapter();

    adapter.captureException({ message: 'provider payload failed' });

    expect(otelMocks.emit).toHaveBeenCalledWith(
      expect.objectContaining({
        body: 'provider payload failed',
        eventName: 'exception.captured',
        exception: 'provider payload failed',
        severityNumber: 17,
        severityText: 'ERROR',
      })
    );
  });

  it('marks Boxed Result.Error span returns as failed operations', async () => {
    const { Result } = await import('@swan-io/boxed');
    const { createOpenTelemetryAdapter } =
      await import('@/composition/telemetry/otel-adapter');
    const adapter = createOpenTelemetryAdapter();
    const error = new Error('provider failed');

    const result = await adapter.startSpan(
      { name: 'auth.userHasPermission', op: 'auth.provider' },
      async () => Result.Error(error)
    );

    expect(result.isError()).toBe(true);
    expect(otelMocks.state.startedSpan?.recordException).toHaveBeenCalledWith(
      error
    );
    expect(otelMocks.state.startedSpan?.setStatus).toHaveBeenCalledWith({
      code: 'ERROR',
      message: 'provider failed',
    });
    expect(otelMocks.state.startedSpan?.end).toHaveBeenCalledTimes(1);
  });

  it('emits captured exceptions as OTel logs when no span is active', async () => {
    const { createOpenTelemetryAdapter } =
      await import('@/composition/telemetry/otel-adapter');
    const adapter = createOpenTelemetryAdapter();

    adapter.captureException('string failure');

    expect(otelMocks.emit).toHaveBeenCalledWith(
      expect.objectContaining({
        body: 'string failure',
        eventName: 'exception.captured',
        exception: 'string failure',
        severityNumber: 17,
        severityText: 'ERROR',
      })
    );
  });
});
