import { describe, expect, it, vi } from 'vitest';

import { toGenreId } from '@/modules/kernel/domain/ids';
import { createAuthenticatedContext } from '@/tests/server/test-utils';

import { createGenreHandlers, zGetAllInput } from './genre-handlers';

describe('genre HTTP transport handlers', () => {
  it('maps list input and protected scope to the list use case', async () => {
    const ctx = createAuthenticatedContext();
    const list = vi.fn(async () => ({
      ok: true as const,
      value: { items: [], total: 0 },
    }));
    const handlers = createGenreHandlers({
      getUseCases: () => ({ list }) as ExplicitAny,
    });

    await handlers.getAll(
      ctx,
      zGetAllInput().parse({
        cursor: 'genre-1',
        limit: '3',
        searchTerm: ' sci-fi ',
      })
    );

    expect(list).toHaveBeenCalledWith({
      scope: ctx.scope,
      cursor: toGenreId('genre-1'),
      limit: 3,
      searchTerm: 'sci-fi',
    });
  });
});
