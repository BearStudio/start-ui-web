import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  createNoOpTelemetry,
  setTelemetry,
  type TelemetryAdapter,
} from '@/platform/telemetry';

afterEach(() => {
  setTelemetry(createNoOpTelemetry());
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('frontend logger', () => {
  it('batches frontend logs to the backend log route with active trace context', async () => {
    const telemetry: TelemetryAdapter = {
      ...createNoOpTelemetry(),
      currentCorrelation: () => ({ spanId: 'span-1', traceId: 'trace-1' }),
    };
    setTelemetry(telemetry);
    vi.stubGlobal('window', {
      addEventListener: vi.fn(),
      location: { hostname: 'localhost' },
    });
    vi.stubGlobal('document', {
      addEventListener: vi.fn(),
      visibilityState: 'visible',
    });
    vi.stubGlobal('navigator', {
      sendBeacon: vi.fn(() => false),
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 202 }))
    );
    const { flushFrontendLogs, frontendLogger } =
      await import('@/platform/telemetry/frontend-logger');

    frontendLogger.info('query.success', {
      details: { operationName: 'book.getAll' },
    });
    await flushFrontendLogs();

    expect(fetch).toHaveBeenCalledWith(
      '/api/telemetry/logs',
      expect.objectContaining({
        method: 'POST',
      })
    );
    const body = JSON.parse(
      vi.mocked(fetch).mock.calls[0]?.[1]?.body as string
    ) as { records: Array<Record<string, unknown>> };
    expect(body.records[0]).toMatchObject({
      event: 'query.success',
      spanId: 'span-1',
      traceId: 'trace-1',
    });
  });

  it('keeps logs queued for retry when the backend log route returns an error status', async () => {
    vi.stubGlobal('window', {
      addEventListener: vi.fn(),
      location: { hostname: 'localhost' },
    });
    vi.stubGlobal('document', {
      addEventListener: vi.fn(),
      visibilityState: 'visible',
    });
    vi.stubGlobal('navigator', {
      sendBeacon: vi.fn(() => false),
    });
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(new Response(null, { status: 500 }))
        .mockResolvedValueOnce(new Response(null, { status: 202 }))
    );
    const { flushFrontendLogs, frontendLogger } =
      await import('@/platform/telemetry/frontend-logger');

    frontendLogger.warn('query.retry', {
      details: { operationName: 'book.getAll' },
    });
    await flushFrontendLogs();
    await flushFrontendLogs();

    expect(fetch).toHaveBeenCalledTimes(2);
    const retryBody = JSON.parse(
      vi.mocked(fetch).mock.calls[1]?.[1]?.body as string
    ) as { records: Array<Record<string, unknown>> };
    expect(retryBody.records[0]).toMatchObject({
      event: 'query.retry',
      level: 'warn',
    });
  });
});
