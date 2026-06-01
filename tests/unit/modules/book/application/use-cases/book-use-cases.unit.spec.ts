import { Result } from '@swan-io/boxed';
import { describe, expect, it } from 'vitest';

import type { PermissionChecker } from '@/modules/kernel';
import type { ApplicationResult } from '@/modules/kernel/application/result';
import { toBookId, toGenreId, toUserId } from '@/modules/kernel';

import type { BookUseCaseDeps } from '@/modules/book/application/use-cases/types';
import type { BookRepository } from '@/modules/book/application/ports/book-repository';
import type { Book } from '@/modules/book/domain/book';
import { createBookUseCases } from '@/modules/book/factory';

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
  hasPermission: async () => Result.Ok({ type: 'permission_granted' }),
};

const forbidden: PermissionChecker = {
  hasPermission: async () => Result.Ok({ type: 'permission_denied' }),
};

const scope = {
  userId: toUserId('user-1'),
  role: 'user',
} as const;

function makeRepo(overrides: Partial<BookRepository> = {}): BookRepository {
  return {
    list: async () =>
      Result.Ok({
        type: 'book_listed',
        page: { items: [book], total: 1 },
      }),
    getById: async () => Result.Ok({ type: 'book_found', book }),
    create: async () => Result.Ok({ type: 'book_created', book }),
    update: async () => Result.Ok({ type: 'book_updated', book }),
    delete: async () => Result.Ok({ type: 'book_deleted' }),
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

function getOk<TOutcome extends { type: string }>(
  result: ApplicationResult<TOutcome>
) {
  if (result.isError()) throw result.getError();
  return result.get();
}

describe('book use cases', () => {
  it('lists books and returns forbidden when permission is missing', async () => {
    const listed = await createBookUseCases(makeDeps()).list({
      scope,
      limit: 20,
      searchTerm: '',
    });

    expect(getOk(listed)).toMatchObject({
      type: 'book_listed',
      page: { total: 1 },
    });

    const denied = await createBookUseCases(
      makeDeps({ permissionChecker: forbidden })
    ).list({
      scope,
      limit: 20,
      searchTerm: '',
    });

    expect(getOk(denied)).toEqual({ type: 'book_forbidden' });
  });

  it('gets a book or returns not_found', async () => {
    const missing = await createBookUseCases(
      makeDeps({
        bookRepository: makeRepo({
          getById: async () => Result.Ok({ type: 'book_not_found' }),
        }),
      })
    ).get({ scope, id: toBookId('missing') });

    expect(getOk(missing)).toEqual({ type: 'book_not_found' });
  });

  it('creates and maps duplicate conflicts', async () => {
    const duplicateRepo = makeRepo({
      create: async () => Result.Ok({ type: 'book_duplicate' }),
    });

    const created = await createBookUseCases(makeDeps()).create({
      scope,
      book,
    });
    expect(getOk(created)).toEqual({ type: 'book_created', book });

    const duplicate = await createBookUseCases(
      makeDeps({ bookRepository: duplicateRepo })
    ).create({
      scope,
      book,
    });

    expect(getOk(duplicate)).toEqual({ type: 'book_duplicate' });
  });

  it('updates and deletes with not_found branches', async () => {
    let transactionRuns = 0;
    const useCases = createBookUseCases(
      makeDeps({
        bookRepository: makeRepo({
          update: async () => Result.Ok({ type: 'book_not_found' }),
          delete: async () => Result.Ok({ type: 'book_not_found' }),
        }),
        onTransactionRun: () => {
          transactionRuns += 1;
        },
      })
    );

    const updated = await useCases.update({
      scope,
      id: toBookId('missing'),
      book,
    });

    expect(getOk(updated)).toEqual({ type: 'book_not_found' });
    expect(transactionRuns).toBe(1);
    const deleted = await useCases.delete({
      scope,
      id: toBookId('missing'),
    });

    expect(getOk(deleted)).toEqual({ type: 'book_not_found' });
    expect(transactionRuns).toBe(1);
  });

  it('uses the transaction context repository for updates', async () => {
    const outsideRepository = makeRepo({
      update: async () => {
        throw new Error('outside repository should not update');
      },
    });
    const transactionRepository = makeRepo({
      update: async () => Result.Ok({ type: 'book_updated', book }),
    });
    const useCases = createBookUseCases({
      ...makeDeps({ bookRepository: outsideRepository }),
      transactionRunner: {
        run: (work) => work({ bookRepository: transactionRepository }),
      },
    });

    const updated = await useCases.update({
      scope,
      id: toBookId('book-1'),
      book,
    });

    expect(getOk(updated)).toEqual({ type: 'book_updated', book });
  });

  it('prepares cover uploads through permission and object-key policy', async () => {
    const prepared = await createBookUseCases(makeDeps()).prepareCoverUpload({
      scope,
      fileType: 'image/webp',
    });
    expect(getOk(prepared)).toEqual({
      type: 'book_cover_upload_prepared',
      upload: { objectKey: 'books/generated-cover-id.webp' },
    });

    const denied = await createBookUseCases(
      makeDeps({ permissionChecker: forbidden })
    ).prepareCoverUpload({ scope, fileType: 'image/webp' });
    expect(getOk(denied)).toEqual({ type: 'book_cover_upload_forbidden' });

    const invalid = await createBookUseCases(makeDeps()).prepareCoverUpload({
      scope,
      fileType: 'text/plain',
    });
    expect(getOk(invalid)).toEqual({
      type: 'book_cover_upload_invalid_file_type',
    });
  });
});
