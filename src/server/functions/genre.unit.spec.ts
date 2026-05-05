import { describe, expect, it } from 'vitest';

import { handlers } from '@/server/functions/genre.handlers.server';
import {
  chainResult,
  createAuthenticatedContext,
  expectedPermissionRequest,
  mockDb,
  mockUserHasPermission,
} from '@/server/functions/test-utils';

const now = new Date();

const mockGenreFromDb = {
  id: 'genre-1',
  name: 'Fiction',
  color: '#ff0000',
  createdAt: now,
  updatedAt: now,
};

const defaultGetAllInput = { limit: 20 };

describe('genre handlers', () => {
  describe('getAll', () => {
    it('should return paginated genres with total count', async () => {
      mockDb.select.mockReturnValueOnce(chainResult([{ count: 1 }]));
      mockDb.query.genre.findMany.mockResolvedValue([mockGenreFromDb]);

      const result = await handlers.getAll(
        createAuthenticatedContext(),
        defaultGetAllInput
      );

      expect(result).toEqual({
        items: [mockGenreFromDb],
        nextCursor: undefined,
        total: 1,
      });
    });

    it('should return nextCursor when there are more items than limit', async () => {
      const genresFromDb = Array.from({ length: 4 }, (_, i) => ({
        ...mockGenreFromDb,
        id: `genre-${i + 1}`,
      }));
      mockDb.select.mockReturnValueOnce(chainResult([{ count: 10 }]));
      mockDb.query.genre.findMany.mockResolvedValue(genresFromDb);

      const result = await handlers.getAll(createAuthenticatedContext(), {
        limit: 3,
      });

      expect(result.items).toHaveLength(3);
      expect(result.nextCursor).toBe('genre-4');
      expect(result.total).toBe(10);
    });

    it('should not return nextCursor when items fit within limit', async () => {
      mockDb.select.mockReturnValueOnce(chainResult([{ count: 1 }]));
      mockDb.query.genre.findMany.mockResolvedValue([mockGenreFromDb]);

      const result = await handlers.getAll(createAuthenticatedContext(), {
        limit: 5,
      });

      expect(result.nextCursor).toBeUndefined();
    });

    it('should return an empty page when the cursor no longer exists', async () => {
      mockDb.query.genre.findFirst.mockResolvedValue(undefined);
      mockDb.select.mockReturnValueOnce(chainResult([{ count: 10 }]));

      const result = await handlers.getAll(createAuthenticatedContext(), {
        ...defaultGetAllInput,
        cursor: 'deleted-genre',
      });

      expect(result).toEqual({
        items: [],
        nextCursor: undefined,
        total: 10,
      });
      expect(mockDb.query.genre.findMany).not.toHaveBeenCalled();
    });

    it('should require genre read permission', async () => {
      mockDb.select.mockReturnValueOnce(chainResult([{ count: 0 }]));
      mockDb.query.genre.findMany.mockResolvedValue([]);

      await handlers.getAll(createAuthenticatedContext(), defaultGetAllInput);

      expect(mockUserHasPermission).toHaveBeenCalledWith(
        expectedPermissionRequest({ genre: ['read'] })
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
});
