import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  createAppQueryClient,
  shouldRetryQuery,
} from '@/platform/lib/tanstack-query/query-client';
import {
  createNoOpTelemetry,
  setTelemetry,
  type TelemetryAdapter,
} from '@/platform/telemetry';

afterEach(() => {
  setTelemetry(createNoOpTelemetry());
});

describe('createAppQueryClient', () => {
  it('sets bounded query and mutation defaults', () => {
    const client = createAppQueryClient();
    const queryDefaults = client.getDefaultOptions().queries;
    const mutationDefaults = client.getDefaultOptions().mutations;

    expect(queryDefaults?.gcTime).toBe(5 * 60_000);
    expect(queryDefaults?.staleTime).toBe(60_000);
    expect(queryDefaults?.retry).toBe(shouldRetryQuery);
    expect(mutationDefaults?.retry).toBe(0);
  });

  it('records query and mutation cache telemetry callbacks', async () => {
    const telemetry: TelemetryAdapter = {
      ...createNoOpTelemetry(),
      recordMetric: vi.fn(),
    };
    setTelemetry(telemetry);
    const client = createAppQueryClient();

    await client.fetchQuery({
      queryFn: async () => 'ok',
      queryKey: ['book', 'getAll'] as const,
    });
    const mutation = client.getMutationCache().build(client, {
      mutationFn: async () => 'ok',
      mutationKey: ['book', 'create'] as const,
    });
    await mutation.execute(undefined);

    expect(telemetry.recordMetric).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.objectContaining({
          'operation.name': 'book.getAll',
          status: 'success',
        }),
        name: 'app.query.cache.event',
      })
    );
    expect(telemetry.recordMetric).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.objectContaining({
          'operation.name': 'book.create',
          status: 'success',
        }),
        name: 'app.query.cache.event',
      })
    );
  });
});

describe('shouldRetryQuery', () => {
  it('does not retry client errors', () => {
    expect(shouldRetryQuery(0, { status: 400 })).toBe(false);
    expect(shouldRetryQuery(0, { status: 401 })).toBe(false);
    expect(shouldRetryQuery(0, { status: 403 })).toBe(false);
    expect(shouldRetryQuery(0, { status: 404 })).toBe(false);
    expect(shouldRetryQuery(0, { status: 499 })).toBe(false);
  });

  it('retries transient and network failures only up to the configured bound', () => {
    expect(shouldRetryQuery(0, { status: 500 })).toBe(true);
    expect(shouldRetryQuery(1, new Error('network'))).toBe(true);
    expect(shouldRetryQuery(2, { status: 500 })).toBe(false);
    expect(shouldRetryQuery(2, new Error('network'))).toBe(false);
  });

  it('retries errors without numeric HTTP status', () => {
    expect(shouldRetryQuery(0, new Error('network failure'))).toBe(true);
    expect(shouldRetryQuery(0, { message: 'error' })).toBe(true);
    expect(shouldRetryQuery(0, null)).toBe(true);
    expect(shouldRetryQuery(0, undefined)).toBe(true);
    expect(shouldRetryQuery(0, { status: 'not-a-number' })).toBe(true);
  });
});
