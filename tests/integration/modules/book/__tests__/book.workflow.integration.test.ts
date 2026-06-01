import { Result } from '@swan-io/boxed';
import { describe, expect, it } from 'vitest';

import type { RequestScope } from '@/modules/auth';
import {
  type Book,
  type BookRepository,
  type BookWriteInput,
  createBookUseCases,
} from '@/modules/book';
import {
  type ApplicationResult,
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
  hasPermission: async () => Result.Ok({ type: 'permission_granted' }),
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

    return Result.Ok({
      type: 'book_listed' as const,
      page: {
        items,
        total: allItems.length,
        ...(nextItem ? { nextCursor: nextItem.id } : {}),
      },
    });
  }

  async getById(id: BookId) {
    const book = this.books.get(id);
    return Result.Ok(
      book
        ? { type: 'book_found' as const, book }
        : { type: 'book_not_found' as const }
    );
  }

  async create(input: BookWriteInput) {
    if (this.#isDuplicate(input)) {
      return Result.Ok({ type: 'book_duplicate' as const });
    }

    const id = toBookId(`book-${this.#nextId}`);
    this.#nextId += 1;
    const book = this.#toBook(id, input);
    this.books.set(id, book);
    return Result.Ok({ type: 'book_created' as const, book });
  }

  async update(id: BookId, input: BookWriteInput) {
    const existing = this.books.get(id);
    if (!existing) return Result.Ok({ type: 'book_not_found' as const });
    if (this.#isDuplicate(input, id)) {
      return Result.Ok({ type: 'book_duplicate' as const });
    }

    const book = this.#toBook(id, input, existing.createdAt);
    this.books.set(id, book);
    return Result.Ok({ type: 'book_updated' as const, book });
  }

  async delete(id: BookId) {
    return Result.Ok(
      this.books.delete(id)
        ? { type: 'book_deleted' as const }
        : { type: 'book_not_found' as const }
    );
  }

  #toBook(id: BookId, input: BookWriteInput, createdAt = now): Book {
    return {
      author: input.author,
      coverId: input.coverId ?? null,
      createdAt,
      genre: null,
      genreId: input.genreId,
      id,
      publisher: input.publisher ?? null,
      title: input.title,
      updatedAt: now,
    };
  }

  #isDuplicate(input: BookWriteInput, currentId?: BookId) {
    const duplicate = [...this.books.values()].find(
      (book) =>
        book.id !== currentId &&
        book.title.toLowerCase() === input.title.toLowerCase() &&
        book.author.toLowerCase() === input.author.toLowerCase()
    );

    return duplicate !== undefined;
  }
}

function getOk<TOutcome extends { type: string }>(
  result: ApplicationResult<TOutcome>
) {
  if (result.isError()) throw result.getError();
  return result.get();
}

describe('book public workflow integration', () => {
  it('creates, lists, updates, rejects duplicates, and deletes through the public use-case API', async () => {
    const bookRepository = new InMemoryBookRepository();
    const useCases = createBookUseCases({
      bookRepository,
      transactionRunner: {
        run: (work) => work({ bookRepository }),
      },
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

    expect(getOk(created)).toMatchObject({
      type: 'book_created',
      book: {
        author: 'Frank Herbert',
        coverId: 'cover-1',
        publisher: 'Ace',
        title: 'Dune',
      },
    });

    const createdId = expectBookId(created);

    const listed = await useCases.list({
      limit: 10,
      scope,
      searchTerm: 'dune',
    });
    expect(getOk(listed)).toMatchObject({
      type: 'book_listed',
      page: {
        items: [{ id: createdId, title: 'Dune' }],
        total: 1,
      },
    });

    const updated = await useCases.update({
      book: {
        author: 'Ursula K. Le Guin',
        genreId,
        publisher: ' ',
        title: ' A Wizard of Earthsea ',
      },
      id: createdId,
      scope,
    });
    expect(getOk(updated)).toMatchObject({
      type: 'book_updated',
      book: {
        author: 'Ursula K. Le Guin',
        publisher: null,
        title: 'A Wizard of Earthsea',
      },
    });

    const duplicate = await useCases.create({
      book: {
        author: ' ursula k. le guin ',
        genreId,
        title: ' a wizard of earthsea ',
      },
      scope,
    });
    expect(getOk(duplicate)).toEqual({ type: 'book_duplicate' });

    const deleted = await useCases.delete({ id: createdId, scope });
    expect(getOk(deleted)).toEqual({ type: 'book_deleted' });
    const missing = await useCases.get({ id: createdId, scope });
    expect(getOk(missing)).toEqual({ type: 'book_not_found' });
  });
});

function expectBookId(
  result: Awaited<ReturnType<ReturnType<typeof createBookUseCases>['create']>>
) {
  const outcome = getOk(result);
  if (outcome.type !== 'book_created') {
    throw new Error(`Expected created book, got ${outcome.type}`);
  }
  return outcome.book.id;
}
