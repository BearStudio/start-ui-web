import { describe, expect, it } from 'vitest';

import type { Book as BookFromDb } from '@/server/db/schema';
import { handlers } from '@/server/functions/book.handlers.server';
import {
  chainResult,
  createAuthenticatedContext,
  expectedPermissionRequest,
  mockDb,
  mockUserHasPermission,
} from '@/server/functions/test-utils';

const now = new Date();

const mockGenre = {
  id: 'genre-1',
  name: 'Fiction',
  color: '#ff0000',
  createdAt: now,
  updatedAt: now,
};

const mockBookFromDb: BookFromDb & { genre: typeof mockGenre } = {
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

const defaultGetAllInput = { limit: 20, searchTerm: '' };

describe('book handlers', () => {
  describe('getAll', () => {
    it('should return paginated books with total count', async () => {
      mockDb.select.mockReturnValueOnce(chainResult([{ count: 1 }]));
      mockDb.query.book.findMany.mockResolvedValue([mockBookFromDb]);

      const result = await handlers.getAll(
        createAuthenticatedContext(),
        defaultGetAllInput
      );

      expect(result).toEqual({
        items: [mockBookFromDb],
        nextCursor: undefined,
        total: 1,
      });
    });

    it('should return nextCursor when there are more items than limit', async () => {
      const booksFromDb = Array.from({ length: 4 }, (_, i) => ({
        ...mockBookFromDb,
        id: `book-${i + 1}`,
      }));
      mockDb.select.mockReturnValueOnce(chainResult([{ count: 10 }]));
      mockDb.query.book.findMany.mockResolvedValue(booksFromDb);

      const result = await handlers.getAll(createAuthenticatedContext(), {
        ...defaultGetAllInput,
        limit: 3,
      });

      expect(result.items).toHaveLength(3);
      expect(result.nextCursor).toBe('book-4');
      expect(result.total).toBe(10);
    });

    it('should not return nextCursor when items fit within limit', async () => {
      mockDb.select.mockReturnValueOnce(chainResult([{ count: 1 }]));
      mockDb.query.book.findMany.mockResolvedValue([mockBookFromDb]);

      const result = await handlers.getAll(createAuthenticatedContext(), {
        ...defaultGetAllInput,
        limit: 5,
      });

      expect(result.nextCursor).toBeUndefined();
    });

    it('should return an empty page when the cursor no longer exists', async () => {
      mockDb.query.book.findFirst.mockResolvedValue(undefined);
      mockDb.select.mockReturnValueOnce(chainResult([{ count: 10 }]));

      const result = await handlers.getAll(createAuthenticatedContext(), {
        ...defaultGetAllInput,
        cursor: 'deleted-book',
      });

      expect(result).toEqual({
        items: [],
        nextCursor: undefined,
        total: 10,
      });
      expect(mockDb.query.book.findMany).not.toHaveBeenCalled();
    });

    it('should require book read permission', async () => {
      mockDb.select.mockReturnValueOnce(chainResult([{ count: 0 }]));
      mockDb.query.book.findMany.mockResolvedValue([]);

      await handlers.getAll(createAuthenticatedContext(), defaultGetAllInput);

      expect(mockUserHasPermission).toHaveBeenCalledWith(
        expectedPermissionRequest({ book: ['read'] })
      );
    });

    it('should throw FORBIDDEN when user lacks permission', async () => {
      mockUserHasPermission.mockResolvedValue({
        success: false,
        error: false,
      });

      await expect(
        handlers.getAll(createAuthenticatedContext(), defaultGetAllInput)
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });
  });

  describe('getById', () => {
    it('should return a book when found', async () => {
      mockDb.query.book.findFirst.mockResolvedValue(mockBookFromDb);

      const result = await handlers.getById(createAuthenticatedContext(), {
        id: 'book-1',
      });

      expect(result).toEqual(mockBookFromDb);
    });

    it('should throw NOT_FOUND when book does not exist', async () => {
      mockDb.query.book.findFirst.mockResolvedValue(undefined);

      await expect(
        handlers.getById(createAuthenticatedContext(), { id: 'nonexistent' })
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('should require book read permission', async () => {
      mockDb.query.book.findFirst.mockResolvedValue(mockBookFromDb);

      await handlers.getById(createAuthenticatedContext(), { id: 'book-1' });

      expect(mockUserHasPermission).toHaveBeenCalledWith(
        expectedPermissionRequest({ book: ['read'] })
      );
    });

    it('should throw FORBIDDEN when user lacks permission', async () => {
      mockUserHasPermission.mockResolvedValue({
        success: false,
        error: false,
      });

      await expect(
        handlers.getById(createAuthenticatedContext(), { id: 'book-1' })
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
      mockDb.insert.mockReturnValueOnce(chainResult([createdBookFromDb]));

      const result = await handlers.create(
        createAuthenticatedContext(),
        createInput
      );

      expect(result).toEqual(createdBookFromDb);
    });

    it('should throw INTERNAL_SERVER_ERROR when no row is returned', async () => {
      mockDb.insert.mockReturnValueOnce(chainResult([]));

      await expect(
        handlers.create(createAuthenticatedContext(), createInput)
      ).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
      });
    });

    it('should require book create permission', async () => {
      mockDb.insert.mockReturnValueOnce(
        chainResult([{ ...mockBookFromDb, ...createInput }])
      );

      await handlers.create(createAuthenticatedContext(), createInput);

      expect(mockUserHasPermission).toHaveBeenCalledWith(
        expectedPermissionRequest({ book: ['create'] })
      );
    });

    it('should throw FORBIDDEN when user lacks permission', async () => {
      mockUserHasPermission.mockResolvedValue({
        success: false,
        error: false,
      });

      await expect(
        handlers.create(createAuthenticatedContext(), createInput)
      ).rejects.toMatchObject({
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
      mockDb.update.mockReturnValueOnce(chainResult([updatedBookFromDb]));

      const result = await handlers.updateById(
        createAuthenticatedContext(),
        updateInput
      );

      expect(result).toEqual(updatedBookFromDb);
    });

    it('should throw NOT_FOUND when book does not exist', async () => {
      mockDb.update.mockReturnValueOnce(chainResult([]));

      await expect(
        handlers.updateById(createAuthenticatedContext(), updateInput)
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('should require book update permission', async () => {
      mockDb.update.mockReturnValueOnce(
        chainResult([{ ...mockBookFromDb, ...updateInput }])
      );

      await handlers.updateById(createAuthenticatedContext(), updateInput);

      expect(mockUserHasPermission).toHaveBeenCalledWith(
        expectedPermissionRequest({ book: ['update'] })
      );
    });

    it('should throw FORBIDDEN when user lacks permission', async () => {
      mockUserHasPermission.mockResolvedValue({
        success: false,
        error: false,
      });

      await expect(
        handlers.updateById(createAuthenticatedContext(), updateInput)
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });
  });

  describe('deleteById', () => {
    it('should delete a book successfully', async () => {
      mockDb.delete.mockReturnValueOnce(chainResult([{ id: 'book-1' }]));

      await expect(
        handlers.deleteById(createAuthenticatedContext(), { id: 'book-1' })
      ).resolves.toBeUndefined();
    });

    it('should throw NOT_FOUND when book does not exist', async () => {
      mockDb.delete.mockReturnValueOnce(chainResult([]));

      await expect(
        handlers.deleteById(createAuthenticatedContext(), { id: 'nonexistent' })
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('should require book delete permission', async () => {
      mockDb.delete.mockReturnValueOnce(chainResult([{ id: 'book-1' }]));

      await handlers.deleteById(createAuthenticatedContext(), { id: 'book-1' });

      expect(mockUserHasPermission).toHaveBeenCalledWith(
        expectedPermissionRequest({ book: ['delete'] })
      );
    });

    it('should throw FORBIDDEN when user lacks permission', async () => {
      mockUserHasPermission.mockResolvedValue({
        success: false,
        error: false,
      });

      await expect(
        handlers.deleteById(createAuthenticatedContext(), { id: 'book-1' })
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });
  });
});
