import { describe, expect, it, vi } from 'vitest';

import { toBookId, toGenreId } from '@/modules/kernel/domain/ids';
import { createAuthenticatedContext } from '@/tests/server/test-utils';

import {
  createBookHandlers,
  zCreateInput,
  zGetAllInput,
} from './book-handlers';

describe('book HTTP transport handlers', () => {
  it('maps list input and protected scope to the list use case', async () => {
    const ctx = createAuthenticatedContext();
    const list = vi.fn(async () => ({
      ok: true as const,
      value: { items: [], total: 0 },
    }));
    const handlers = createBookHandlers({
      getUseCases: () => ({ list }) as ExplicitAny,
    });

    await expect(
      handlers.getAll(
        ctx,
        zGetAllInput().parse({
          cursor: 'book-1',
          limit: '7',
          searchTerm: ' dune ',
        })
      )
    ).resolves.toEqual({ items: [], total: 0 });

    expect(list).toHaveBeenCalledWith({
      scope: ctx.scope,
      cursor: toBookId('book-1'),
      limit: 7,
      searchTerm: 'dune',
    });
  });

  it('maps create input into domain write values', async () => {
    const ctx = createAuthenticatedContext();
    const create = vi.fn(async () => ({
      ok: true as const,
      value: { id: toBookId('book-1') },
    }));
    const handlers = createBookHandlers({
      getUseCases: () => ({ create }) as ExplicitAny,
    });

    await expect(
      handlers.create(
        ctx,
        zCreateInput().parse({
          title: 'Dune',
          author: 'Frank Herbert',
          genreId: 'genre-1',
          publisher: null,
          coverId: 'cover-1',
        })
      )
    ).resolves.toEqual({ id: toBookId('book-1') });

    expect(create).toHaveBeenCalledWith({
      scope: ctx.scope,
      book: {
        title: 'Dune',
        author: 'Frank Herbert',
        genreId: toGenreId('genre-1'),
        publisher: null,
        coverId: 'cover-1',
      },
    });
  });
});
