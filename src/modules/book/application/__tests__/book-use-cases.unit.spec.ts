import { describe, expect, it } from 'vitest';

import type { PermissionChecker } from '@/modules/kernel/application/ports/permission-checker';
import { AppError } from '@/modules/kernel/domain/errors/app-error';
import { toBookId, toGenreId, toUserId } from '@/modules/kernel/domain/ids';

import type { BookRepository } from '../ports/book-repository';
import type { Book } from '../../domain/book';
import { createBookUseCases } from '../../factory';

const now = new Date('2026-01-01T00:00:00.000Z');
const book: Book = {
  id: toBookId('book-1'),
  title: 'Dune',
  author: 'Frank Herbert',
  genreId: toGenreId('genre-1'),
  genre: null,
  publisher: null,
  coverId: null,
  createdAt: now,
  updatedAt: now,
};

const logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
};

const allowed: PermissionChecker = {
  hasPermission: async () => true,
};

const forbidden: PermissionChecker = {
  hasPermission: async () => false,
};

function makeRepo(overrides: Partial<BookRepository> = {}): BookRepository {
  return {
    list: async () => ({ items: [book], total: 1 }),
    getById: async () => book,
    create: async () => book,
    update: async () => book,
    delete: async () => true,
    ...overrides,
  };
}

describe('book use cases', () => {
  it('lists books and returns forbidden when permission is missing', async () => {
    await expect(
      createBookUseCases({
        bookRepository: makeRepo(),
        permissionChecker: allowed,
        logger,
      }).list({ currentUserId: toUserId('user-1'), limit: 20, searchTerm: '' })
    ).resolves.toMatchObject({ ok: true, value: { total: 1 } });

    await expect(
      createBookUseCases({
        bookRepository: makeRepo(),
        permissionChecker: forbidden,
        logger,
      }).list({ currentUserId: toUserId('user-1'), limit: 20, searchTerm: '' })
    ).resolves.toEqual({ ok: false, reason: 'forbidden' });
  });

  it('gets a book or returns not_found', async () => {
    await expect(
      createBookUseCases({
        bookRepository: makeRepo({ getById: async () => null }),
        permissionChecker: allowed,
        logger,
      }).get({ currentUserId: toUserId('user-1'), id: toBookId('missing') })
    ).resolves.toEqual({ ok: false, reason: 'not_found' });
  });

  it('creates and maps duplicate conflicts', async () => {
    const duplicateRepo = makeRepo({
      create: async () => {
        throw new AppError({
          code: 'BOOK_DUPLICATE',
          category: 'conflict',
          status: 409,
        });
      },
    });

    await expect(
      createBookUseCases({
        bookRepository: makeRepo(),
        permissionChecker: allowed,
        logger,
      }).create({ currentUserId: toUserId('user-1'), book })
    ).resolves.toMatchObject({ ok: true });

    await expect(
      createBookUseCases({
        bookRepository: duplicateRepo,
        permissionChecker: allowed,
        logger,
      }).create({ currentUserId: toUserId('user-1'), book })
    ).resolves.toEqual({ ok: false, reason: 'duplicate' });
  });

  it('updates and deletes with not_found branches', async () => {
    const useCases = createBookUseCases({
      bookRepository: makeRepo({
        update: async () => null,
        delete: async () => false,
      }),
      permissionChecker: allowed,
      logger,
    });

    await expect(
      useCases.update({
        currentUserId: toUserId('user-1'),
        id: toBookId('missing'),
        book,
      })
    ).resolves.toEqual({ ok: false, reason: 'not_found' });
    await expect(
      useCases.delete({
        currentUserId: toUserId('user-1'),
        id: toBookId('missing'),
      })
    ).resolves.toEqual({ ok: false, reason: 'not_found' });
  });
});
