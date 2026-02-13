import { call } from '@orpc/server';
import { describe, expect, it, vi } from 'vitest';

import { Prisma } from '@/server/db/generated/client';
import {
  mockDb,
  mockGetSession,
  mockSession,
  mockUser,
  mockUserHasPermission,
} from '@/server/routers/test-utils';
import userRouter from '@/server/routers/user';

const { mockRemoveUser, mockRevokeUserSessions, mockRevokeUserSession } =
  vi.hoisted(() => ({
    mockRemoveUser: vi.fn(),
    mockRevokeUserSessions: vi.fn(),
    mockRevokeUserSession: vi.fn(),
  }));

vi.mock('@/server/auth', () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
      userHasPermission: (...args: unknown[]) => mockUserHasPermission(...args),
      removeUser: (...args: unknown[]) => mockRemoveUser(...args),
      revokeUserSessions: (...args: unknown[]) =>
        mockRevokeUserSessions(...args),
      revokeUserSession: (...args: unknown[]) => mockRevokeUserSession(...args),
    },
  },
}));

const now = new Date();

const mockUserFromDb = {
  id: 'target-user-1',
  name: 'Target User',
  email: 'target@example.com',
  emailVerified: true,
  role: 'user' as const,
  image: null,
  createdAt: now,
  updatedAt: now,
  onboardedAt: null,
};

const mockSessionFromDb = {
  id: 'session-1',
  token: 'session-token-1',
  createdAt: now,
  updatedAt: now,
  expiresAt: new Date(Date.now() + 86400000),
};

describe('user router', () => {
  describe('getAll', () => {
    it('should return paginated users with total count', async () => {
      mockDb.user.count.mockResolvedValue(1);
      mockDb.user.findMany.mockResolvedValue([mockUserFromDb]);

      const result = await call(userRouter.getAll, {});

      expect(result).toEqual({
        items: [mockUserFromDb],
        nextCursor: undefined,
        total: 1,
      });
    });

    it('should return nextCursor when there are more items than limit', async () => {
      const usersFromDb = Array.from({ length: 4 }, (_, i) => ({
        ...mockUserFromDb,
        id: `user-${i + 1}`,
      }));
      mockDb.user.count.mockResolvedValue(10);
      mockDb.user.findMany.mockResolvedValue(usersFromDb);

      const result = await call(userRouter.getAll, { limit: 3 });

      expect(result.items).toHaveLength(3);
      expect(result.nextCursor).toBe('user-4');
      expect(result.total).toBe(10);
    });

    it('should not return nextCursor when items fit within limit', async () => {
      mockDb.user.count.mockResolvedValue(1);
      mockDb.user.findMany.mockResolvedValue([mockUserFromDb]);

      const result = await call(userRouter.getAll, { limit: 5 });

      expect(result.nextCursor).toBeUndefined();
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(call(userRouter.getAll, {})).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('should require user list permission', async () => {
      mockDb.user.count.mockResolvedValue(0);
      mockDb.user.findMany.mockResolvedValue([]);

      await call(userRouter.getAll, {});

      expect(mockUserHasPermission).toHaveBeenCalledWith({
        body: {
          userId: mockUser.id,
          permission: { user: ['list'] },
        },
      });
    });

    it('should throw FORBIDDEN when user lacks permission', async () => {
      mockUserHasPermission.mockResolvedValue({
        success: false,
        error: false,
      });

      await expect(call(userRouter.getAll, {})).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });
  });

  describe('getById', () => {
    it('should return a user when found', async () => {
      mockDb.user.findUnique.mockResolvedValue(mockUserFromDb);

      const result = await call(userRouter.getById, { id: 'target-user-1' });

      expect(result).toEqual(mockUserFromDb);
    });

    it('should throw NOT_FOUND when user does not exist', async () => {
      mockDb.user.findUnique.mockResolvedValue(null);

      await expect(
        call(userRouter.getById, { id: 'nonexistent' })
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(userRouter.getById, { id: 'target-user-1' })
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('should require user list permission', async () => {
      mockDb.user.findUnique.mockResolvedValue(mockUserFromDb);

      await call(userRouter.getById, { id: 'target-user-1' });

      expect(mockUserHasPermission).toHaveBeenCalledWith({
        body: {
          userId: mockUser.id,
          permission: { user: ['list'] },
        },
      });
    });

    it('should throw FORBIDDEN when user lacks permission', async () => {
      mockUserHasPermission.mockResolvedValue({
        success: false,
        error: false,
      });

      await expect(
        call(userRouter.getById, { id: 'target-user-1' })
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });
  });

  describe('create', () => {
    const createInput = {
      name: 'New User',
      email: 'new@example.com',
      role: 'user' as const,
    };

    it('should create a user and return it', async () => {
      const createdUser = { ...mockUserFromDb, ...createInput, id: 'new-1' };
      mockDb.user.create.mockResolvedValue(createdUser);

      const result = await call(userRouter.create, createInput);

      expect(result).toEqual(createdUser);
    });

    it('should throw CONFLICT on unique constraint violation (P2002)', async () => {
      mockDb.user.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '0.0.0',
          meta: { target: ['email'] },
        })
      );

      await expect(call(userRouter.create, createInput)).rejects.toMatchObject({
        code: 'CONFLICT',
        data: { target: ['email'] },
      });
    });

    it('should throw INTERNAL_SERVER_ERROR on unexpected errors', async () => {
      mockDb.user.create.mockRejectedValue(new Error('DB connection lost'));

      await expect(call(userRouter.create, createInput)).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
      });
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(call(userRouter.create, createInput)).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('should require user create permission', async () => {
      mockDb.user.create.mockResolvedValue({
        ...mockUserFromDb,
        ...createInput,
      });

      await call(userRouter.create, createInput);

      expect(mockUserHasPermission).toHaveBeenCalledWith({
        body: {
          userId: mockUser.id,
          permission: { user: ['create'] },
        },
      });
    });

    it('should throw FORBIDDEN when user lacks permission', async () => {
      mockUserHasPermission.mockResolvedValue({
        success: false,
        error: false,
      });

      await expect(call(userRouter.create, createInput)).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });
  });

  describe('updateById', () => {
    const updateInput = {
      id: 'target-user-1',
      name: 'Updated Name',
      email: 'updated@example.com',
      role: 'admin' as const,
    };

    it('should update a user and return it', async () => {
      mockDb.user.findUnique.mockResolvedValue({
        email: 'target@example.com',
      });
      const updatedUser = { ...mockUserFromDb, ...updateInput };
      mockDb.user.update.mockResolvedValue(updatedUser);

      const result = await call(userRouter.updateById, updateInput);

      expect(result).toEqual(updatedUser);
    });

    it('should prevent changing own role', async () => {
      const selfUpdateInput = {
        id: mockUser.id,
        name: 'New Name',
        email: 'self@example.com',
        role: 'admin' as const,
      };
      mockDb.user.findUnique.mockResolvedValue({
        email: 'self@example.com',
      });
      const returnedUser = {
        ...mockUserFromDb,
        id: mockUser.id,
        name: 'New Name',
        email: 'self@example.com',
        role: 'user',
      };
      mockDb.user.update.mockResolvedValue(returnedUser);

      const result = await call(userRouter.updateById, selfUpdateInput);

      expect(result.role).toBe('user');
    });

    it('should throw NOT_FOUND when target user does not exist', async () => {
      mockDb.user.findUnique.mockResolvedValue(null);

      await expect(
        call(userRouter.updateById, updateInput)
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('should throw CONFLICT on unique constraint violation (P2002)', async () => {
      mockDb.user.findUnique.mockResolvedValue({
        email: 'target@example.com',
      });
      mockDb.user.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '0.0.0',
          meta: { target: ['email'] },
        })
      );

      await expect(
        call(userRouter.updateById, updateInput)
      ).rejects.toMatchObject({
        code: 'CONFLICT',
        data: { target: ['email'] },
      });
    });

    it('should throw INTERNAL_SERVER_ERROR on unexpected errors', async () => {
      mockDb.user.findUnique.mockResolvedValue({
        email: 'target@example.com',
      });
      mockDb.user.update.mockRejectedValue(new Error('DB connection lost'));

      await expect(
        call(userRouter.updateById, updateInput)
      ).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
      });
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(userRouter.updateById, updateInput)
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('should require user set-role permission', async () => {
      mockDb.user.findUnique.mockResolvedValue({
        email: 'target@example.com',
      });
      mockDb.user.update.mockResolvedValue({
        ...mockUserFromDb,
        ...updateInput,
      });

      await call(userRouter.updateById, updateInput);

      expect(mockUserHasPermission).toHaveBeenCalledWith({
        body: {
          userId: mockUser.id,
          permission: { user: ['set-role'] },
        },
      });
    });

    it('should throw FORBIDDEN when user lacks permission', async () => {
      mockUserHasPermission.mockResolvedValue({
        success: false,
        error: false,
      });

      await expect(
        call(userRouter.updateById, updateInput)
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });
  });

  describe('deleteById', () => {
    it('should delete a user', async () => {
      mockRemoveUser.mockResolvedValue({ success: true });

      await expect(
        call(userRouter.deleteById, { id: 'target-user-1' })
      ).resolves.toBeUndefined();
    });

    it('should prevent deleting yourself', async () => {
      await expect(
        call(userRouter.deleteById, { id: mockUser.id })
      ).rejects.toMatchObject({
        code: 'BAD_REQUEST',
      });
    });

    it('should throw INTERNAL_SERVER_ERROR when removeUser fails', async () => {
      mockRemoveUser.mockResolvedValue({ success: false });

      await expect(
        call(userRouter.deleteById, { id: 'target-user-1' })
      ).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
      });
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(userRouter.deleteById, { id: 'target-user-1' })
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('should require user delete permission', async () => {
      mockRemoveUser.mockResolvedValue({ success: true });

      await call(userRouter.deleteById, { id: 'target-user-1' });

      expect(mockUserHasPermission).toHaveBeenCalledWith({
        body: {
          userId: mockUser.id,
          permission: { user: ['delete'] },
        },
      });
    });

    it('should throw FORBIDDEN when user lacks permission', async () => {
      mockUserHasPermission.mockResolvedValue({
        success: false,
        error: false,
      });

      await expect(
        call(userRouter.deleteById, { id: 'target-user-1' })
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });
  });

  describe('getUserSessions', () => {
    it('should return paginated sessions with total count', async () => {
      mockDb.session.count.mockResolvedValue(1);
      mockDb.session.findMany.mockResolvedValue([mockSessionFromDb]);

      const result = await call(userRouter.getUserSessions, {
        userId: 'target-user-1',
      });

      expect(result).toEqual({
        items: [mockSessionFromDb],
        nextCursor: undefined,
        total: 1,
      });
    });

    it('should return nextCursor when there are more items than limit', async () => {
      const sessions = Array.from({ length: 4 }, (_, i) => ({
        ...mockSessionFromDb,
        id: `session-${i + 1}`,
      }));
      mockDb.session.count.mockResolvedValue(10);
      mockDb.session.findMany.mockResolvedValue(sessions);

      const result = await call(userRouter.getUserSessions, {
        userId: 'target-user-1',
        limit: 3,
      });

      expect(result.items).toHaveLength(3);
      expect(result.nextCursor).toBe('session-4');
      expect(result.total).toBe(10);
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(userRouter.getUserSessions, { userId: 'target-user-1' })
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('should require session list permission', async () => {
      mockDb.session.count.mockResolvedValue(0);
      mockDb.session.findMany.mockResolvedValue([]);

      await call(userRouter.getUserSessions, { userId: 'target-user-1' });

      expect(mockUserHasPermission).toHaveBeenCalledWith({
        body: {
          userId: mockUser.id,
          permission: { session: ['list'] },
        },
      });
    });

    it('should throw FORBIDDEN when user lacks permission', async () => {
      mockUserHasPermission.mockResolvedValue({
        success: false,
        error: false,
      });

      await expect(
        call(userRouter.getUserSessions, { userId: 'target-user-1' })
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });
  });

  describe('revokeUserSessions', () => {
    it('should revoke all sessions for a user', async () => {
      mockRevokeUserSessions.mockResolvedValue({ success: true });

      await expect(
        call(userRouter.revokeUserSessions, { id: 'target-user-1' })
      ).resolves.toBeUndefined();
    });

    it('should prevent revoking own sessions', async () => {
      await expect(
        call(userRouter.revokeUserSessions, { id: mockUser.id })
      ).rejects.toMatchObject({
        code: 'BAD_REQUEST',
      });
    });

    it('should throw INTERNAL_SERVER_ERROR when revoke fails', async () => {
      mockRevokeUserSessions.mockResolvedValue({ success: false });

      await expect(
        call(userRouter.revokeUserSessions, { id: 'target-user-1' })
      ).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
      });
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(userRouter.revokeUserSessions, { id: 'target-user-1' })
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('should require session revoke permission', async () => {
      mockRevokeUserSessions.mockResolvedValue({ success: true });

      await call(userRouter.revokeUserSessions, { id: 'target-user-1' });

      expect(mockUserHasPermission).toHaveBeenCalledWith({
        body: {
          userId: mockUser.id,
          permission: { session: ['revoke'] },
        },
      });
    });

    it('should throw FORBIDDEN when user lacks permission', async () => {
      mockUserHasPermission.mockResolvedValue({
        success: false,
        error: false,
      });

      await expect(
        call(userRouter.revokeUserSessions, { id: 'target-user-1' })
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });
  });

  describe('revokeUserSession', () => {
    it('should revoke a specific session', async () => {
      mockRevokeUserSession.mockResolvedValue({ success: true });

      await expect(
        call(userRouter.revokeUserSession, {
          id: 'target-user-1',
          sessionToken: 'other-token',
        })
      ).resolves.toBeUndefined();
    });

    it('should prevent revoking own current session', async () => {
      mockGetSession.mockResolvedValue({
        user: mockUser,
        session: { ...mockSession, token: 'my-token' },
      });

      await expect(
        call(userRouter.revokeUserSession, {
          id: mockUser.id,
          sessionToken: 'my-token',
        })
      ).rejects.toMatchObject({
        code: 'BAD_REQUEST',
      });
    });

    it('should throw INTERNAL_SERVER_ERROR when revoke fails', async () => {
      mockRevokeUserSession.mockResolvedValue({ success: false });

      await expect(
        call(userRouter.revokeUserSession, {
          id: 'target-user-1',
          sessionToken: 'other-token',
        })
      ).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
      });
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(userRouter.revokeUserSession, {
          id: 'target-user-1',
          sessionToken: 'other-token',
        })
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('should require session revoke permission', async () => {
      mockRevokeUserSession.mockResolvedValue({ success: true });

      await call(userRouter.revokeUserSession, {
        id: 'target-user-1',
        sessionToken: 'other-token',
      });

      expect(mockUserHasPermission).toHaveBeenCalledWith({
        body: {
          userId: mockUser.id,
          permission: { session: ['revoke'] },
        },
      });
    });

    it('should throw FORBIDDEN when user lacks permission', async () => {
      mockUserHasPermission.mockResolvedValue({
        success: false,
        error: false,
      });

      await expect(
        call(userRouter.revokeUserSession, {
          id: 'target-user-1',
          sessionToken: 'other-token',
        })
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });
  });
});
