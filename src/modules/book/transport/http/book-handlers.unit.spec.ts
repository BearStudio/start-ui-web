import { describe, expect, it, vi } from 'vitest';

import { toBookId, toGenreId } from '@/modules/kernel/domain/ids';
import { createAuthenticatedContext } from '@/tests/server/test-utils';
import { fc, PROPERTY_DEFAULTS, test } from '@/tests/support/property-testing';

import {
  createBookHandlers,
  zCreateInput,
  zGetAllInput,
} from './book-handlers';

const validPaginationLimit = fc.integer({ max: 100, min: 1 });
const invalidPaginationLimit = fc.oneof(
  fc.integer({ max: 0, min: -1_000 }),
  fc.integer({ max: 1_000, min: 101 }),
  fc.integer({ max: 99, min: 1 }).map((value) => value + 0.5),
  fc.constantFrom('NaN', 'abc', '1.5')
);
const searchTerm = fc.string({ maxLength: 80 });

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

  test.prop([validPaginationLimit, fc.boolean()], PROPERTY_DEFAULTS)(
    'parses generated valid list pagination limits',
    (limit, asString) => {
      expect(
        zGetAllInput().parse({ limit: asString ? String(limit) : limit }).limit
      ).toBe(limit);
    }
  );

  it('defaults missing list pagination limits', () => {
    expect(zGetAllInput().parse({}).limit).toBe(20);
  });

  test.prop([invalidPaginationLimit], PROPERTY_DEFAULTS)(
    'rejects generated invalid list pagination limits',
    (limit) => {
      expect(() => zGetAllInput().parse({ limit })).toThrow();
    }
  );

  test.prop([searchTerm], PROPERTY_DEFAULTS)(
    'trims generated list search terms',
    (term) => {
      expect(
        zGetAllInput().parse({ searchTerm: ` \t${term}\n ` })
      ).toMatchObject({
        searchTerm: term.trim(),
      });
    }
  );
});
