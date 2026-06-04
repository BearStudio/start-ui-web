import { describe, expect, it, vi } from 'vitest';

import { genreQueries } from '@/modules/genre/client';
import { createGenreQueries } from '@/modules/genre/presentation/queries';
import { toScopeKey } from '@/modules/kernel/domain/ids';

describe('genre query keys', () => {
  it('partitions protected read keys by scope', () => {
    const scopeA = toScopeKey('scope-a');
    const scopeB = toScopeKey('scope-b');

    expect(genreQueries.all()).toEqual(['genre', 'v1']);
    expect(genreQueries.getAll(scopeA)).toEqual([
      'genre',
      'v1',
      { scopeKey: scopeA },
      'getAll',
    ]);
    expect(genreQueries.getAllList({ scopeKey: scopeA }).queryKey).not.toEqual(
      genreQueries.getAllList({ scopeKey: scopeB }).queryKey
    );
  });

  it('calls the injected facade with server function data payloads', async () => {
    const facade = {
      genreGetAll: vi.fn(async () => ({ items: [], total: 0 })),
    };
    const queries = createGenreQueries(facade);

    await (
      queries.getAllList({
        scopeKey: toScopeKey('scope-a'),
        searchTerm: 'fantasy',
      }).queryFn as () => Promise<unknown>
    )();

    expect(facade.genreGetAll).toHaveBeenCalledWith({
      data: { searchTerm: 'fantasy' },
    });
  });
});
