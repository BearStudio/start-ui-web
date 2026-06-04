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
      queryKey: ['book', 'v1', 'getAll'] as const,
    });
    const mutation = client.getMutationCache().build(client, {
      mutationFn: async () => 'ok',
      mutationKey: ['book', 'v1', 'create'] as const,
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

  it('keeps broad cache operations compatible with versioned query keys', async () => {
    const client = createAppQueryClient();
    const userListKey = [
      'user',
      'v1',
      { scopeKey: 'scope-a' },
      'getAll',
    ] as const;
    const userDetailKey = [
      'user',
      'v1',
      { scopeKey: 'scope-a' },
      'getById',
      { id: 'user-1' },
    ] as const;
    const bookListKey = [
      'book',
      'v1',
      { scopeKey: 'scope-a' },
      'getAll',
    ] as const;

    client.setQueryData(userListKey, ['user-list']);
    client.setQueryData(userDetailKey, { id: 'user-1' });
    client.setQueryData(bookListKey, ['book-list']);

    await client.invalidateQueries({ queryKey: ['user'] });

    expect(
      client.getQueryCache().find({ queryKey: userListKey })?.state
        .isInvalidated
    ).toBe(true);
    expect(
      client.getQueryCache().find({ queryKey: userDetailKey })?.state
        .isInvalidated
    ).toBe(true);
    expect(
      client.getQueryCache().find({ queryKey: bookListKey })?.state
        .isInvalidated
    ).toBe(false);

    client.removeQueries({ queryKey: ['user'] });

    expect(client.getQueryData(userListKey)).toBeUndefined();
    expect(client.getQueryData(userDetailKey)).toBeUndefined();
    expect(client.getQueryData(bookListKey)).toEqual(['book-list']);
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
