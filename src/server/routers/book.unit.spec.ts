import { call } from '@orpc/server';
import { DrizzleQueryError } from 'drizzle-orm/errors';
import { omit } from 'remeda';
import { describe, expect, it } from 'vitest';

import { Book } from '@/features/book/schema';
import bookRouter from '@/server/routers/book';
import {
  mockDb,
  mockGetSession,
  mockUser,
  mockUserHasPermission,
} from '@/server/routers/test-utils';

const now = new Date();

type BookFromDb = Book & {
  genreId: string | null;
};

const mockGenre = {
  id: 'genre-1',
  name: 'Fiction',
  color: '#ff0000',
  createdAt: now,
  updatedAt: now,
};

const mockBookFromDb = {
  id: 'book-1',
  title: 'Test Book',
  author: 'Test Author',
  genre: mockGenre,
  genreId: 'genre-1',
  publisher: 'Test Publisher',
  coverId: null,
  createdAt: now,
  updatedAt: now,
};

const toExpectedBook = (mock: BookFromDb): Book => omit(mock, ['genreId']);

function drizzleError(code: string, extras: Record<string, unknown> = {}) {
  const error = new DrizzleQueryError(
    {
      sql: 'mock query',
      params: [],
    } as never,
    []
  );
  error.cause = { code, ...extras } as unknown as Error;
  return error;
}

describe('book router', () => {
  describe('getAll', () => {
    it('should return paginated books with total count', async () => {
      mockDb.book.count.mockResolvedValue(1);
      mockDb.book.findMany.mockResolvedValue([mockBookFromDb]);

      const result = await call(bookRouter.getAll, {});

      expect(result).toEqual({
        items: [toExpectedBook(mockBookFromDb)],
        nextCursor: undefined,
        total: 1,
      });
    });

    it('should return nextCursor when there are more items than limit', async () => {
      const booksFromDb = Array.from({ length: 4 }, (_, i) => ({
        ...mockBookFromDb,
        id: `book-${i + 1}`,
      }));
      mockDb.book.count.mockResolvedValue(10);
      mockDb.book.findMany.mockResolvedValue(booksFromDb);

      const result = await call(bookRouter.getAll, { limit: 3 });

      expect(result.items).toHaveLength(3);
      expect(result.nextCursor).toBe('book-3');
      expect(result.total).toBe(10);
    });

    it('should not return nextCursor when items fit within limit', async () => {
      mockDb.book.count.mockResolvedValue(1);
      mockDb.book.findMany.mockResolvedValue([mockBookFromDb]);

      const result = await call(bookRouter.getAll, { limit: 5 });

      expect(result.nextCursor).toBeUndefined();
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(call(bookRouter.getAll, {})).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('should require book read permission', async () => {
      mockDb.book.count.mockResolvedValue(0);
      mockDb.book.findMany.mockResolvedValue([]);

      await call(bookRouter.getAll, {});

      expect(mockUserHasPermission).toHaveBeenCalledWith({
        body: {
          userId: mockUser.id,
          permissions: { book: ['read'] },
        },
      });
    });

    it('should throw FORBIDDEN when user lacks permission', async () => {
      mockUserHasPermission.mockResolvedValue({
        success: false,
        error: false,
      });

      await expect(call(bookRouter.getAll, {})).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });
  });

  describe('getById', () => {
    it('should return a book when found', async () => {
      mockDb.book.findUnique.mockResolvedValue(mockBookFromDb);

      const result = await call(bookRouter.getById, { id: 'book-1' });

      expect(result).toEqual(toExpectedBook(mockBookFromDb));
    });

    it('should throw NOT_FOUND when book does not exist', async () => {
      mockDb.book.findUnique.mockResolvedValue(null);

      await expect(
        call(bookRouter.getById, { id: 'nonexistent' })
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(bookRouter.getById, { id: 'book-1' })
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('should require book read permission', async () => {
      mockDb.book.findUnique.mockResolvedValue(mockBookFromDb);

      await call(bookRouter.getById, { id: 'book-1' });

      expect(mockUserHasPermission).toHaveBeenCalledWith({
        body: {
          userId: mockUser.id,
          permissions: { book: ['read'] },
        },
      });
    });

    it('should throw FORBIDDEN when user lacks permission', async () => {
      mockUserHasPermission.mockResolvedValue({
        success: false,
        error: false,
      });

      await expect(
        call(bookRouter.getById, { id: 'book-1' })
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });
  });

  describe('create', () => {
    const createInput = {
      title: 'New Book',
      author: 'New Author',
      genreId: 'genre-1',
      publisher: 'Publisher',
      coverId: null,
    };

    it('should create a book and return it', async () => {
      const createdBookFromDb = {
        ...mockBookFromDb,
        ...createInput,
        id: 'new-book-1',
      };
      mockDb.book.create.mockResolvedValue(createdBookFromDb);

      const result = await call(bookRouter.create, createInput);

      expect(result).toEqual(toExpectedBook(createdBookFromDb));
    });

    it('should throw CONFLICT on unique constraint violation', async () => {
      mockDb.book.create.mockRejectedValue(
        drizzleError('23505', {
          constraint_name: 'book_title_author_key',
          detail: 'Key (title, author)=(New Book, New Author) already exists.',
        })
      );

      await expect(call(bookRouter.create, createInput)).rejects.toMatchObject({
        code: 'CONFLICT',
        data: { target: ['title', 'author'] },
      });
    });

    it('should throw INTERNAL_SERVER_ERROR on unexpected errors', async () => {
      mockDb.book.create.mockRejectedValue(new Error('DB connection lost'));

      await expect(call(bookRouter.create, createInput)).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
      });
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(call(bookRouter.create, createInput)).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('should require book create permission', async () => {
      mockDb.book.create.mockResolvedValue({
        ...mockBookFromDb,
        ...createInput,
      });

      await call(bookRouter.create, createInput);

      expect(mockUserHasPermission).toHaveBeenCalledWith({
        body: {
          userId: mockUser.id,
          permissions: { book: ['create'] },
        },
      });
    });

    it('should throw FORBIDDEN when user lacks permission', async () => {
      mockUserHasPermission.mockResolvedValue({
        success: false,
        error: false,
      });

      await expect(call(bookRouter.create, createInput)).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });
  });

  describe('updateById', () => {
    const updateInput = {
      id: 'book-1',
      title: 'Updated Title',
      author: 'Updated Author',
      genreId: 'genre-1',
      publisher: 'Updated Publisher',
      coverId: 'cover-1',
    };

    it('should update a book and return it', async () => {
      const updatedBookFromDb = { ...mockBookFromDb, ...updateInput };
      mockDb.book.findUnique.mockResolvedValue(mockBookFromDb);
      mockDb.book.update.mockResolvedValue(updatedBookFromDb);

      const result = await call(bookRouter.updateById, updateInput);

      expect(result).toEqual(toExpectedBook(updatedBookFromDb));
    });

    it('should throw CONFLICT on unique constraint violation', async () => {
      mockDb.book.findUnique.mockResolvedValue(mockBookFromDb);
      mockDb.book.update.mockRejectedValue(
        drizzleError('23505', {
          constraint_name: 'book_title_author_key',
          detail:
            'Key (title, author)=(Updated Title, Updated Author) already exists.',
        })
      );

      await expect(
        call(bookRouter.updateById, updateInput)
      ).rejects.toMatchObject({
        code: 'CONFLICT',
        data: { target: ['title', 'author'] },
      });
    });

    it('should throw NOT_FOUND when update target does not exist', async () => {
      mockDb.book.findUnique.mockResolvedValue(null);

      await expect(
        call(bookRouter.updateById, updateInput)
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });

      expect(mockDb.book.update).not.toHaveBeenCalled();
    });

    it('should throw INTERNAL_SERVER_ERROR on unexpected errors', async () => {
      mockDb.book.findUnique.mockResolvedValue(mockBookFromDb);
      mockDb.book.update.mockRejectedValue(new Error('DB connection lost'));

      await expect(
        call(bookRouter.updateById, updateInput)
      ).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
      });
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(bookRouter.updateById, updateInput)
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('should require book update permission', async () => {
      mockDb.book.findUnique.mockResolvedValue(mockBookFromDb);
      mockDb.book.update.mockResolvedValue({
        ...mockBookFromDb,
        ...updateInput,
      });

      await call(bookRouter.updateById, updateInput);

      expect(mockUserHasPermission).toHaveBeenCalledWith({
        body: {
          userId: mockUser.id,
          permissions: { book: ['update'] },
        },
      });
    });

    it('should throw FORBIDDEN when user lacks permission', async () => {
      mockUserHasPermission.mockResolvedValue({
        success: false,
        error: false,
      });

      await expect(
        call(bookRouter.updateById, updateInput)
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });
  });

  describe('deleteById', () => {
    it('should delete a book successfully', async () => {
      mockDb.book.findUnique.mockResolvedValue(mockBookFromDb);
      mockDb.book.delete.mockResolvedValue(mockBookFromDb);

      await expect(
        call(bookRouter.deleteById, { id: 'book-1' })
      ).resolves.toBeUndefined();
    });

    it('should throw NOT_FOUND when delete cannot find the book', async () => {
      mockDb.book.findUnique.mockResolvedValue(null);

      await expect(
        call(bookRouter.deleteById, { id: 'nonexistent' })
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('should throw INTERNAL_SERVER_ERROR on unexpected errors', async () => {
      mockDb.book.findUnique.mockResolvedValue(mockBookFromDb);
      mockDb.book.delete.mockRejectedValue(new Error('DB connection lost'));

      await expect(
        call(bookRouter.deleteById, { id: 'book-1' })
      ).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
      });
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(bookRouter.deleteById, { id: 'book-1' })
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('should require book delete permission', async () => {
      mockDb.book.findUnique.mockResolvedValue(mockBookFromDb);
      mockDb.book.delete.mockResolvedValue(mockBookFromDb);

      await call(bookRouter.deleteById, { id: 'book-1' });

      expect(mockUserHasPermission).toHaveBeenCalledWith({
        body: {
          userId: mockUser.id,
          permissions: { book: ['delete'] },
        },
      });
    });

    it('should throw FORBIDDEN when user lacks permission', async () => {
      mockUserHasPermission.mockResolvedValue({
        success: false,
        error: false,
      });

      await expect(
        call(bookRouter.deleteById, { id: 'book-1' })
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });
  });
});
