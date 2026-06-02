import { describe, expect, it } from 'vitest';

import {
  nullableQueryToAsyncOption,
  nullableQueryToAsyncOptionResult,
  queryToAsyncData,
  queryToAsyncResult,
} from '@/platform/lib/tanstack-query/boxed';

type QueryStatus = 'pending' | 'error' | 'success';
type FetchStatus = 'idle' | 'fetching' | 'paused';

function queryState<TData, TError = Error>(input: {
  data?: TData;
  error?: TError | null;
  status: QueryStatus;
  fetchStatus?: FetchStatus;
}) {
  return {
    data: input.data,
    error: input.error ?? null,
    status: input.status,
    fetchStatus: input.fetchStatus ?? 'idle',
  };
}

describe('Boxed TanStack Query adapters', () => {
  it('maps an idle pending query to AsyncData.NotAsked', () => {
    const value = queryToAsyncData({
      data: undefined as string | undefined,
      fetchStatus: 'idle',
      status: 'pending',
    });

    expect(value.isNotAsked()).toBe(true);
  });

  it('maps an in-flight pending query to AsyncData.Loading', () => {
    const value = queryToAsyncData({
      data: undefined as string | undefined,
      fetchStatus: 'fetching',
      status: 'pending',
    });

    expect(value.isLoading()).toBe(true);
  });

  it('maps a successful query to AsyncData.Done', () => {
    const value = queryToAsyncData({
      data: 'loaded',
      fetchStatus: 'idle',
      status: 'success',
    });

    expect(value.isDone()).toBe(true);
    expect(value).toMatchObject({ tag: 'Done', value: 'loaded' });
  });

  it('maps a successful query to AsyncData.Done(Result.Ok)', () => {
    const value = queryToAsyncResult(
      queryState({ data: 'loaded', status: 'success' })
    );

    expect(value.isDone()).toBe(true);
    expect(value).toMatchObject({
      tag: 'Done',
      value: { tag: 'Ok', value: 'loaded' },
    });
  });

  it('maps a failed query to AsyncData.Done(Result.Error)', () => {
    const error = new Error('failed');
    const value = queryToAsyncResult(
      queryState<string>({ error, status: 'error' })
    );

    expect(value.isDone()).toBe(true);
    expect(value).toMatchObject({
      tag: 'Done',
      value: { error, tag: 'Error' },
    });
  });

  it('maps nullable successful data to AsyncData.Done(Option)', () => {
    const some = nullableQueryToAsyncOption({
      data: 'loaded',
      fetchStatus: 'idle',
      status: 'success',
    });
    const none = nullableQueryToAsyncOption({
      data: null,
      fetchStatus: 'idle',
      status: 'success',
    });

    expect(some).toMatchObject({
      tag: 'Done',
      value: { tag: 'Some', value: 'loaded' },
    });
    expect(none).toMatchObject({
      tag: 'Done',
      value: { tag: 'None' },
    });
  });

  it('maps nullable successful data to AsyncData.Done(Result.Ok(Option))', () => {
    const value = nullableQueryToAsyncOptionResult(
      queryState<string | null>({ data: null, status: 'success' })
    );

    expect(value).toMatchObject({
      tag: 'Done',
      value: { tag: 'Ok', value: { tag: 'None' } },
    });
  });
});
