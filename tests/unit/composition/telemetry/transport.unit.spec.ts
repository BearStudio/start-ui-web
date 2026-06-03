import { beforeEach, describe, expect, it, vi } from 'vitest';

const configMock = vi.hoisted(() => ({
  browserDsn: undefined as string | undefined,
  collectorBearerToken: undefined as string | undefined,
  collectorUrl: undefined as string | undefined,
  logMaxEvents: 2,
  proxyMaxBytes: 1_000,
}));

const loggerMock = vi.hoisted(() => ({
  debug: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
}));

const telemetryMock = vi.hoisted(() => ({
  captureException: vi.fn(),
  emitLog: vi.fn(),
}));

const localSummaryMock = vi.hoisted(() => vi.fn());

vi.mock('@/modules/kernel/infrastructure/config/telemetry', () => ({
  getTelemetryConfig: () => configMock,
}));

vi.mock('@/composition/kernel', () => ({
  getKernel: () => ({ logger: loggerMock }),
}));

vi.mock('@/platform/telemetry', () => ({
  getTelemetry: () => telemetryMock,
}));

vi.mock('@/composition/telemetry/local-sqlite-sink', () => ({
  recordLocalTelemetrySummary: localSummaryMock,
}));

const sameOriginHeaders = (contentType: string) => ({
  'Content-Type': contentType,
  Origin: 'http://localhost',
  'Sec-Fetch-Site': 'same-origin',
});

const request = (path: string, contentType: string, body: BodyInit) =>
  new Request(`http://localhost${path}`, {
    body,
    headers: sameOriginHeaders(contentType),
    method: 'POST',
  });

describe('telemetry transport handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configMock.browserDsn = undefined;
    configMock.collectorBearerToken = undefined;
    configMock.collectorUrl = undefined;
    configMock.logMaxEvents = 2;
    configMock.proxyMaxBytes = 1_000;
    vi.stubGlobal('fetch', vi.fn());
  });

  it('no-ops OTLP proxy requests when Collector env is missing', async () => {
    const { handleOtlpProxyRequest } =
      await import('@/composition/telemetry/transport');

    const response = await handleOtlpProxyRequest(
      request(
        '/api/telemetry/otel/v1/traces',
        'application/x-protobuf',
        new Uint8Array([1, 2, 3])
      ),
      'traces'
    );

    expect(response.status).toBe(204);
    expect(fetch).not.toHaveBeenCalled();
    expect(localSummaryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'otlp_proxy',
        signal: 'traces',
        statusCode: 204,
      })
    );
  });

  it('forwards OTLP protobuf payloads to the Collector with bearer auth', async () => {
    configMock.collectorBearerToken = 'collector-token';
    configMock.collectorUrl = 'https://collector.example';
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 200 }));
    const { handleOtlpProxyRequest } =
      await import('@/composition/telemetry/transport');

    const response = await handleOtlpProxyRequest(
      request(
        '/api/telemetry/otel/v1/metrics',
        'application/x-protobuf',
        new Uint8Array([1])
      ),
      'metrics'
    );

    expect(response.status).toBe(202);
    expect(fetch).toHaveBeenCalledWith(
      'https://collector.example/v1/metrics',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer collector-token',
          'Content-Type': 'application/x-protobuf',
        }),
        method: 'POST',
      })
    );
  });

  it('rejects telemetry mutations with unsupported content types', async () => {
    const { handleOtlpProxyRequest } =
      await import('@/composition/telemetry/transport');

    const response = await handleOtlpProxyRequest(
      request('/api/telemetry/otel/v1/traces', 'application/json', '{}'),
      'traces'
    );

    expect(response.status).toBe(415);
  });

  it('rejects streamed telemetry bodies as soon as the configured byte limit is exceeded', async () => {
    configMock.proxyMaxBytes = 3;
    let canceled = false;
    const body = new ReadableStream<Uint8Array>({
      cancel() {
        canceled = true;
      },
      start(controller) {
        controller.enqueue(new Uint8Array([1, 2]));
        controller.enqueue(new Uint8Array([1, 2]));
        controller.enqueue(new Uint8Array([1, 2]));
        controller.close();
      },
    });
    const streamingRequest = new Request(
      'http://localhost/api/telemetry/otel/v1/traces',
      {
        body,
        headers: {
          ...sameOriginHeaders('application/x-protobuf'),
          'Content-Length': '1',
        },
        method: 'POST',
        duplex: 'half',
      } as RequestInit & { duplex: 'half' }
    );
    const arrayBufferSpy = vi.spyOn(streamingRequest, 'arrayBuffer');
    const { handleOtlpProxyRequest } =
      await import('@/composition/telemetry/transport');

    const response = await handleOtlpProxyRequest(streamingRequest, 'traces');

    expect(response.status).toBe(413);
    expect(arrayBufferSpy).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(canceled).toBe(true);
  });

  it('returns invalid request body when the telemetry request body is already locked', async () => {
    const lockedRequest = request(
      '/api/telemetry/otel/v1/traces',
      'application/x-protobuf',
      'payload'
    );
    const reader = lockedRequest.body?.getReader();
    const { handleOtlpProxyRequest } =
      await import('@/composition/telemetry/transport');

    try {
      const response = await handleOtlpProxyRequest(lockedRequest, 'traces');

      expect(response.status).toBe(400);
      expect(fetch).not.toHaveBeenCalled();
    } finally {
      reader?.releaseLock();
    }
  });

  it('forwards tunneled Sentry envelopes to the DSN envelope endpoint', async () => {
    configMock.browserDsn = 'https://public@o123.ingest.sentry.io/456';
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 200 }));
    const { handleSentryTunnelRequest } =
      await import('@/composition/telemetry/transport');

    const response = await handleSentryTunnelRequest(
      request(
        '/api/telemetry/sentry-tunnel',
        'application/x-sentry-envelope',
        'envelope'
      )
    );

    expect(response.status).toBe(202);
    expect(fetch).toHaveBeenCalledWith(
      'https://o123.ingest.sentry.io/api/456/envelope/',
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('sanitizes frontend logs, writes backend logs, emits OTel logs, and captures frontend errors', async () => {
    const { handleFrontendLogsRequest } =
      await import('@/composition/telemetry/transport');

    const response = await handleFrontendLogsRequest(
      request(
        '/api/telemetry/logs',
        'application/json',
        JSON.stringify({
          records: [
            {
              details: { email: 'person@example.com' },
              error: 'boom',
              event: 'query.error',
              level: 'error',
              spanId: 'span-1',
              timestamp: '2026-06-02T00:00:00.000Z',
              traceId: 'trace-1',
            },
          ],
        })
      )
    );

    expect(response.status).toBe(202);
    expect(loggerMock.error).toHaveBeenCalledWith(
      expect.objectContaining({
        details: expect.objectContaining({
          email: '[REDACTED]',
          spanId: 'span-1',
          traceId: 'trace-1',
        }),
        event: 'frontend.query.error',
      })
    );
    expect(telemetryMock.emitLog).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'frontend.query.error',
        level: 'error',
      })
    );
    expect(telemetryMock.captureException).toHaveBeenCalledOnce();
  });
});
