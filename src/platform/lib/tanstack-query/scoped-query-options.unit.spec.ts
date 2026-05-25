import { describe, expect, it, vi } from 'vitest';

import {
  scopedEntityQueryOptions,
  scopedInfiniteQueryOptions,
  scopedListQueryOptions,
  serverMutationOptions,
} from './scoped-query-options';

describe('scoped query option helpers', () => {
  it('builds list, infinite, entity, and mutation options without leaking scope into data', async () => {
    const listFn = vi.fn(async () => ({ items: [], total: 0 }));
    const list = scopedListQueryOptions({
      baseKey: (scopeKey) => ['book', { scopeKey }, 'getAll'] as const,
      input: { scopeKey: 'scope-a', searchTerm: 'dune' },
      queryFn: listFn,
    });

    expect(list.queryKey).toEqual([
      'book',
      { scopeKey: 'scope-a' },
      'getAll',
      { searchTerm: 'dune' },
    ]);
    await (list.queryFn as unknown as () => Promise<unknown>)();
    expect(listFn).toHaveBeenCalledWith({ searchTerm: 'dune' });

    const infinite = scopedInfiniteQueryOptions({
      baseKey: (scopeKey) => ['book', { scopeKey }, 'getAll'] as const,
      input: { scopeKey: 'scope-a', searchTerm: 'dune' },
      queryFn: async (_data, cursor: string | undefined) => ({
        items: [],
        total: 0,
        nextCursor: cursor,
      }),
    });
    expect(infinite.queryKey).toEqual([
      'book',
      { scopeKey: 'scope-a' },
      'getAll',
      'infinite',
      { searchTerm: 'dune' },
    ]);

    const entity = scopedEntityQueryOptions({
      baseKey: (scopeKey) => ['book', { scopeKey }, 'getById'] as const,
      input: { scopeKey: 'scope-a', id: 'book-1' },
      queryFn: async (data) => data.id,
    });
    expect(entity.queryKey).toEqual([
      'book',
      { scopeKey: 'scope-a' },
      'getById',
      { id: 'book-1' },
    ]);

    const mutationFn = vi.fn(async (_input: { data: { id: string } }) => true);
    const mutation = serverMutationOptions({
      mutationKey: ['book', 'deleteById'],
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
