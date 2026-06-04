import { afterEach, describe, expect, it, vi } from 'vitest';

import { observeHttpRequest } from '@/composition/telemetry/request-observability';
import {
  createNoOpTelemetry,
  setTelemetry,
  type TelemetryAdapter,
} from '@/platform/telemetry';

afterEach(() => {
  setTelemetry(createNoOpTelemetry());
  vi.restoreAllMocks();
});

describe('request observability', () => {
  it('wraps non-telemetry requests in a root span and records duration', async () => {
    const telemetry: TelemetryAdapter = {
      ...createNoOpTelemetry(),
      recordMetric: vi.fn(),
      startSpan: vi.fn((_options, fn) => fn()),
    };
    vi.spyOn(performance, 'now')
      .mockReturnValueOnce(10)
      .mockReturnValueOnce(35);
    setTelemetry(telemetry);

    const result = await observeHttpRequest(
      {
        handlerType: 'router',
        pathname: '/manager/books/c12345678901234567890',
        requestId: 'request-1',
        request: new Request(
          'https://app.example/manager/books/c12345678901234567890',
          { method: 'GET' }
        ),
      },
      async () => ({ response: new Response('ok', { status: 200 }) })
    );

    expect(result.response.status).toBe(200);
    expect(telemetry.startSpan).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.objectContaining({
          'http.request.method': 'GET',
          'http.route': '/manager/books/$id',
          'app.request_id': 'request-1',
          'tanstack.handler_type': 'router',
        }),
        name: 'http.request GET /manager/books/$id',
        op: 'http.server',
      }),
      expect.any(Function)
    );
    expect(telemetry.recordMetric).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.objectContaining({
          'http.response.status_class': '2xx',
          'http.response.status_code': 200,
          'http.route': '/manager/books/$id',
          status: 'success',
        }),
        name: 'app.http.request.duration',
        value: 25,
      })
    );
    expect(
      vi.mocked(telemetry.recordMetric).mock.calls[0]?.[0].attributes
    ).not.toHaveProperty('app.request_id');
  });

  it('does not wrap telemetry export requests', async () => {
    const telemetry: TelemetryAdapter = {
      ...createNoOpTelemetry(),
      recordMetric: vi.fn(),
      startSpan: vi.fn((_options, fn) => fn()),
    };
    setTelemetry(telemetry);

    const result = observeHttpRequest(
      {
        handlerType: 'router',
        pathname: '/api/telemetry/otel/v1/traces',
        request: new Request(
          'https://app.example/api/telemetry/otel/v1/traces'
        ),
      },
      () => 'ok'
    );

    expect(result).toBe('ok');
    expect(telemetry.startSpan).not.toHaveBeenCalled();
    expect(telemetry.recordMetric).not.toHaveBeenCalled();
  });

  it('records an error metric with response status and rethrows when next rejects', async () => {
    const telemetry: TelemetryAdapter = {
      ...createNoOpTelemetry(),
      recordMetric: vi.fn(),
      startSpan: vi.fn((_options, fn) => fn()),
    };
    vi.spyOn(performance, 'now')
      .mockReturnValueOnce(10)
      .mockReturnValueOnce(45);
    setTelemetry(telemetry);
    const thrown = { response: new Response('denied', { status: 403 }) };

    await expect(
      observeHttpRequest(
        {
          handlerType: 'router',
          pathname: '/manager/books/c12345678901234567890',
          request: new Request(
            'https://app.example/manager/books/c12345678901234567890',
            { method: 'GET' }
          ),
        },
        async () => {
          throw thrown;
        }
      )
    ).rejects.toBe(thrown);

    expect(telemetry.recordMetric).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.objectContaining({
          'http.response.status_class': '4xx',
          'http.response.status_code': 403,
          status: 'error',
        }),
        name: 'app.http.request.duration',
        value: 35,
      })
    );
  });
});
