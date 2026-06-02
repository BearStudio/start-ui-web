import { describe, expect, it, vi } from 'vitest';

import {
  scopedEntityQueryOptions,
  scopedInfiniteQueryOptions,
  scopedListQueryOptions,
  serverMutationOptions,
} from '@/platform/lib/tanstack-query/scoped-query-options';

describe('scoped query option helpers', () => {
  it('builds list, infinite, entity, and mutation options without leaking scope into data', async () => {
    const listFn = vi.fn(async () => ({ items: [], total: 0 }));
    const list = scopedListQueryOptions({
      baseKey: (scopeKey) => ['book', 'v1', { scopeKey }, 'getAll'] as const,
      input: { scopeKey: 'scope-a', searchTerm: 'dune' },
      queryFn: listFn,
    });

    expect(list.queryKey).toEqual([
      'book',
      'v1',
      { scopeKey: 'scope-a' },
      'getAll',
      { searchTerm: 'dune' },
    ]);
    await (list.queryFn as unknown as () => Promise<unknown>)();
    expect(listFn).toHaveBeenCalledWith({ searchTerm: 'dune' });

    const infinite = scopedInfiniteQueryOptions({
      baseKey: (scopeKey) => ['book', 'v1', { scopeKey }, 'getAll'] as const,
      input: { scopeKey: 'scope-a', searchTerm: 'dune' },
      queryFn: async (_data, cursor: string | undefined) => ({
        items: [],
        total: 0,
        nextCursor: cursor,
      }),
    });
    expect(infinite.queryKey).toEqual([
      'book',
      'v1',
      { scopeKey: 'scope-a' },
      'getAll',
      'infinite',
      { searchTerm: 'dune' },
    ]);
    const infiniteQueryFn = infinite.queryFn as unknown as (context: {
      pageParam: string;
    }) => Promise<{
      items: [];
      total: number;
      nextCursor: string;
    }>;
    await expect(infiniteQueryFn({ pageParam: 'cursor-1' })).resolves.toEqual({
      items: [],
      total: 0,
      nextCursor: 'cursor-1',
    });
    const getNextPageParam =
      infinite.getNextPageParam as unknown as (lastPage: {
        items: [];
        total: number;
        nextCursor: string;
      }) => string | undefined;
    expect(
      getNextPageParam({
        items: [],
        total: 0,
        nextCursor: 'cursor-2',
      })
    ).toBe('cursor-2');
    expect(infinite.maxPages).toBe(10);

    const limitedInfinite = scopedInfiniteQueryOptions({
      baseKey: (scopeKey) => ['book', 'v1', { scopeKey }, 'getAll'] as const,
      input: { scopeKey: 'scope-a', searchTerm: 'dune' },
      maxPages: 3,
      queryFn: async () => ({
        items: [],
        total: 0,
        nextCursor: undefined,
      }),
    });
    expect(limitedInfinite.maxPages).toBe(3);

    const entity = scopedEntityQueryOptions({
      baseKey: (scopeKey) => ['book', 'v1', { scopeKey }, 'getById'] as const,
      input: { scopeKey: 'scope-a', id: 'book-1' },
      queryFn: async (data) => data.id,
    });
    expect(entity.queryKey).toEqual([
      'book',
      'v1',
      { scopeKey: 'scope-a' },
      'getById',
      { id: 'book-1' },
    ]);
    const entityQueryFn = entity.queryFn as unknown as () => Promise<string>;
    await expect(entityQueryFn()).resolves.toBe('book-1');

    const mutationFn = vi.fn(async (_input: { data: { id: string } }) => true);
    const mutation = serverMutationOptions({
      mutationKey: ['book', 'v1', 'deleteById'],
      mutationFn,
    });
    await (
      mutation.mutationFn as unknown as (data: {
        id: string;
      }) => Promise<unknown>
    )({ id: 'book-1' });
    expect(mutationFn).toHaveBeenCalledWith({ data: { id: 'book-1' } });
  });
});
