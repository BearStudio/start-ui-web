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
      startActiveSpan: vi.fn((_name, _options, fn) =>
        fn({
          end: vi.fn(),
          recordException: vi.fn(),
          setStatus: vi.fn(),
          spanContext: vi.fn(() => ({
            spanId: 'started-span',
            traceFlags: 1,
            traceId: 'started-trace',
          })),
        })
      ),
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
    expect(activeSpan.setStatus).toHaveBeenCalledWith({
      code: 'ERROR',
      message: 'provider failed',
    });
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
        severityText: 'warning',
      })
    );
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
        severityText: 'error',
      })
    );
  });
});
