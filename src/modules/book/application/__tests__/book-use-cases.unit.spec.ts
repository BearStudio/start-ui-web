import { describe, expect, it } from 'vitest';

import type { PermissionChecker } from '@/modules/kernel/application/ports/permission-checker';
import { AppError } from '@/modules/kernel/domain/errors/app-error';
import { toBookId, toGenreId, toUserId } from '@/modules/kernel/domain/ids';

import type { BookRepository } from '../ports/book-repository';
import type { BookUseCaseDeps } from '../use-cases/types';
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
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};
const idGenerator = {
  createId: () => 'generated-cover-id',
};

const allowed: PermissionChecker = {
  hasPermission: async () => true,
};

const forbidden: PermissionChecker = {
  hasPermission: async () => false,
};

const scope = {
  userId: toUserId('user-1'),
  role: 'user',
} as const;

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

function makeDeps(
  input: {
    bookRepository?: BookRepository;
    permissionChecker?: PermissionChecker;
    onTransactionRun?: () => void;
  } = {}
): BookUseCaseDeps {
  const bookRepository = input.bookRepository ?? makeRepo();

  return {
    bookRepository,
    transactionRunner: {
      run: (work) => {
        input.onTransactionRun?.();
        return work({ bookRepository });
      },
    },
    idGenerator,
    permissionChecker: input.permissionChecker ?? allowed,
    logger,
  };
}

describe('book use cases', () => {
  it('lists books and returns forbidden when permission is missing', async () => {
    await expect(
      createBookUseCases(makeDeps()).list({
        scope,
        limit: 20,
        searchTerm: '',
      })
    ).resolves.toMatchObject({ ok: true, value: { total: 1 } });

    await expect(
      createBookUseCases(makeDeps({ permissionChecker: forbidden })).list({
        scope,
        limit: 20,
        searchTerm: '',
      })
    ).resolves.toEqual({ ok: false, reason: 'forbidden' });
  });

  it('gets a book or returns not_found', async () => {
    await expect(
      createBookUseCases(
        makeDeps({ bookRepository: makeRepo({ getById: async () => null }) })
      ).get({ scope, id: toBookId('missing') })
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
      createBookUseCases(makeDeps()).create({ scope, book })
    ).resolves.toMatchObject({ ok: true });

    await expect(
      createBookUseCases(makeDeps({ bookRepository: duplicateRepo })).create({
        scope,
        book,
      })
    ).resolves.toEqual({ ok: false, reason: 'duplicate' });
  });

  it('updates and deletes with not_found branches', async () => {
    let transactionRuns = 0;
    const useCases = createBookUseCases(
      makeDeps({
        bookRepository: makeRepo({
          update: async () => null,
          delete: async () => false,
        }),
        onTransactionRun: () => {
          transactionRuns += 1;
        },
      })
    );

    await expect(
      useCases.update({
        scope,
        id: toBookId('missing'),
        book,
      })
    ).resolves.toEqual({ ok: false, reason: 'not_found' });
    expect(transactionRuns).toBe(1);
    await expect(
      useCases.delete({
        scope,
        id: toBookId('missing'),
      })
    ).resolves.toEqual({ ok: false, reason: 'not_found' });
    expect(transactionRuns).toBe(1);
  });

  it('uses the transaction context repository for updates', async () => {
    const outsideRepository = makeRepo({
      update: async () => {
        throw new Error('outside repository should not update');
      },
    });
    const transactionRepository = makeRepo({
      update: async () => book,
    });
    const useCases = createBookUseCases({
      ...makeDeps({ bookRepository: outsideRepository }),
      transactionRunner: {
        run: (work) => work({ bookRepository: transactionRepository }),
      },
    });

    await expect(
      useCases.update({
        scope,
        id: toBookId('book-1'),
        book,
      })
    ).resolves.toMatchObject({ ok: true, value: book });
  });

  it('prepares cover uploads through permission and object-key policy', async () => {
    await expect(
      createBookUseCases(makeDeps()).prepareCoverUpload({
        scope,
        fileType: 'image/webp',
      })
    ).resolves.toEqual({
      ok: true,
      value: { objectKey: 'books/generated-cover-id.webp' },
    });

    await expect(
      createBookUseCases(
        makeDeps({ permissionChecker: forbidden })
      ).prepareCoverUpload({ scope, fileType: 'image/webp' })
    ).resolves.toEqual({ ok: false, reason: 'forbidden' });

    await expect(
      createBookUseCases(makeDeps()).prepareCoverUpload({
        scope,
        fileType: 'text/plain',
      })
    ).resolves.toEqual({ ok: false, reason: 'invalid_file_type' });
  });
});
