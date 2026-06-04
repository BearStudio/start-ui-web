import { describe, expect, it, vi } from 'vitest';

import { bookQueries } from '@/modules/book/client';
import {
  type BookQueryFacade,
  createBookQueries,
} from '@/modules/book/presentation/queries';
import { toBookId, toScopeKey } from '@/modules/kernel/domain/ids';

describe('book query keys', () => {
  it('partitions protected read keys by scope', () => {
    const scopeA = toScopeKey('scope-a');
    const scopeB = toScopeKey('scope-b');

    expect(bookQueries.all()).toEqual(['book', 'v1']);
    expect(bookQueries.getAll(scopeA)).toEqual([
      'book',
      'v1',
      { scopeKey: scopeA },
      'getAll',
    ]);
    expect(
      bookQueries.getAllInfinite({ scopeKey: scopeA }).queryKey
    ).not.toEqual(bookQueries.getAllInfinite({ scopeKey: scopeB }).queryKey);

    expect(
      bookQueries.getById({ id: toBookId('book-1'), scopeKey: scopeA }).queryKey
    ).toContainEqual({ scopeKey: scopeA });
  });

  it('versions mutation keys', () => {
    expect(bookQueries.create().mutationKey).toEqual(['book', 'v1', 'create']);
    expect(bookQueries.updateById().mutationKey).toEqual([
      'book',
      'v1',
      'updateById',
    ]);
    expect(bookQueries.deleteById().mutationKey).toEqual([
      'book',
      'v1',
      'deleteById',
    ]);
  });

  it('calls injected facade functions with server function data payloads', async () => {
    const facade = {
      bookCreate: vi.fn(async () => ({ type: 'created' })),
      bookDeleteById: vi.fn(async () => ({ type: 'deleted' })),
      bookGetAll: vi.fn(async () => ({ items: [], total: 0 })),
      bookGetById: vi.fn(async () => ({ id: 'book-1' })),
      bookUpdateById: vi.fn(async () => ({ type: 'updated' })),
    } as unknown as BookQueryFacade;
    const queries = createBookQueries(facade);
    const scopeKey = toScopeKey('scope-a');
    const id = toBookId('book-1');

    await (
      queries.getAllList({ scopeKey }).queryFn as () => Promise<unknown>
    )();
    await (
      queries.getById({ id, scopeKey }).queryFn as () => Promise<unknown>
    )();
    await (
      queries.create().mutationFn as (data: {
        title: string;
      }) => Promise<unknown>
    )({ title: 'Dune' });

    expect(facade.bookGetAll).toHaveBeenCalledWith({ data: {} });
    expect(facade.bookGetById).toHaveBeenCalledWith({ data: { id } });
    expect(facade.bookCreate).toHaveBeenCalledWith({
      data: { title: 'Dune' },
    });
  });
});
