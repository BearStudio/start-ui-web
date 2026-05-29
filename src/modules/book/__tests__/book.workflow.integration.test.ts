import { describe, expect, it } from 'vitest';

import type { RequestScope } from '@/modules/auth';
import {
  type Book,
  type BookRepository,
  type BookWriteInput,
  createBookUseCases,
} from '@/modules/book';
import {
  AppError,
  type BookId,
  type Logger,
  type PermissionChecker,
  toBookId,
  toGenreId,
  toUserId,
} from '@/modules/kernel';

const now = new Date('2026-01-01T00:00:00.000Z');
const genreId = toGenreId('genre-1');
const scope: RequestScope = {
  role: 'admin',
  userId: toUserId('admin-1'),
};
const logger: Logger = {
  debug: () => {},
  error: () => {},
  info: () => {},
  warn: () => {},
};
const permissionChecker: PermissionChecker = {
  hasPermission: async () => true,
};

class InMemoryBookRepository implements BookRepository {
  readonly books = new Map<BookId, Book>();

  #nextId = 1;

  async list(input: { cursor?: BookId; limit: number; searchTerm: string }) {
    const normalizedSearch = input.searchTerm.trim().toLowerCase();
    const allItems = [...this.books.values()]
      .filter(
        (book) =>
          normalizedSearch.length === 0 ||
          book.title.toLowerCase().includes(normalizedSearch) ||
          book.author.toLowerCase().includes(normalizedSearch)
      )
      .sort((left, right) => left.title.localeCompare(right.title));
    const startIndex = input.cursor
      ? allItems.findIndex((book) => book.id === input.cursor) + 1
      : 0;
    const items = allItems.slice(startIndex, startIndex + input.limit);
    const nextItem = allItems[startIndex + input.limit];

    return {
      items,
      total: allItems.length,
      ...(nextItem ? { nextCursor: nextItem.id } : {}),
    };
  }

  async getById(id: BookId) {
    return this.books.get(id) ?? null;
  }

  async create(input: BookWriteInput) {
    this.#throwOnDuplicate(input);

    const id = toBookId(`book-${this.#nextId}`);
    this.#nextId += 1;
    const book = this.#toBook(id, input);
    this.books.set(id, book);
    return book;
  }

  async update(id: BookId, input: BookWriteInput) {
    if (!this.books.has(id)) return null;
    this.#throwOnDuplicate(input, id);

    const book = this.#toBook(id, input);
    this.books.set(id, book);
    return book;
  }

  async delete(id: BookId) {
    return this.books.delete(id);
  }

  #toBook(id: BookId, input: BookWriteInput): Book {
    return {
      author: input.author,
      coverId: input.coverId ?? null,
      createdAt: now,
      genre: null,
      genreId: input.genreId,
      id,
      publisher: input.publisher ?? null,
      title: input.title,
      updatedAt: now,
    };
  }

  #throwOnDuplicate(input: BookWriteInput, currentId?: BookId) {
    const duplicate = [...this.books.values()].find(
      (book) =>
        book.id !== currentId &&
        book.title.toLowerCase() === input.title.toLowerCase() &&
        book.author.toLowerCase() === input.author.toLowerCase()
    );

    if (!duplicate) return;

    throw new AppError({
      category: 'conflict',
      code: 'BOOK_DUPLICATE',
      status: 409,
    });
  }
}

describe('book public workflow integration', () => {
  it('creates, lists, updates, rejects duplicates, and deletes through the public use-case API', async () => {
    const bookRepository = new InMemoryBookRepository();
    const useCases = createBookUseCases({
      bookRepository,
      idGenerator: { createId: () => 'cover-id' },
      logger,
      permissionChecker,
    });

    const created = await useCases.create({
      book: {
        author: ' Frank Herbert ',
        coverId: ' cover-1 ',
        genreId,
        publisher: ' Ace ',
        title: ' Dune ',
      },
      scope,
    });

    expect(created).toMatchObject({
      ok: true,
      value: {
        author: 'Frank Herbert',
        coverId: 'cover-1',
        publisher: 'Ace',
        title: 'Dune',
      },
    });

    const createdId = expectBookId(created);

    await expect(
      useCases.list({ limit: 10, scope, searchTerm: 'dune' })
    ).resolves.toMatchObject({
      ok: true,
      value: {
        items: [{ id: createdId, title: 'Dune' }],
        total: 1,
      },
    });

    await expect(
      useCases.update({
        book: {
          author: 'Ursula K. Le Guin',
          genreId,
          publisher: ' ',
          title: ' A Wizard of Earthsea ',
        },
        id: createdId,
        scope,
      })
    ).resolves.toMatchObject({
      ok: true,
      value: {
        author: 'Ursula K. Le Guin',
        publisher: null,
        title: 'A Wizard of Earthsea',
      },
    });

    await expect(
      useCases.create({
        book: {
          author: ' ursula k. le guin ',
          genreId,
          title: ' a wizard of earthsea ',
        },
        scope,
      })
    ).resolves.toEqual({ ok: false, reason: 'duplicate' });

    await expect(
      useCases.delete({ id: createdId, scope })
    ).resolves.toMatchObject({ ok: true });
    await expect(useCases.get({ id: createdId, scope })).resolves.toEqual({
      ok: false,
      reason: 'not_found',
    });
  });
});

function expectBookId(
  result: Awaited<ReturnType<ReturnType<typeof createBookUseCases>['create']>>
) {
  expect(result).toMatchObject({ ok: true });
  if (!result.ok)
    throw new Error(`Expected created book, got ${result.reason}`);
  return result.value.id;
}
