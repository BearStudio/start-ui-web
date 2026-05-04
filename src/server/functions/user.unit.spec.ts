import { describe, expect, it, vi } from 'vitest';

import {
  chainResult,
  createAuthenticatedContext,
  mockDb,
  mockGetSession,
  mockSession,
  mockUser,
  mockUserHasPermission,
} from '@/server/functions/test-utils';
import { handlers } from '@/server/functions/user.handlers.server';

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
  userId: 'target-user-1',
  createdAt: now,
  updatedAt: now,
  expiresAt: new Date(Date.now() + 86400000),
  ipAddress: null,
  userAgent: null,
};

const publicSessionFromDb = {
  id: mockSessionFromDb.id,
  createdAt: mockSessionFromDb.createdAt,
  updatedAt: mockSessionFromDb.updatedAt,
  expiresAt: mockSessionFromDb.expiresAt,
  ipAddress: mockSessionFromDb.ipAddress,
  userAgent: mockSessionFromDb.userAgent,
};

function getSqlColumnNames(value: ExplicitAny): string[] {
  const names: string[] = [];
  const seen = new Set<object>();

  const visit = (node: ExplicitAny) => {
    if (!node || typeof node !== 'object' || seen.has(node)) return;
    seen.add(node);

    if (typeof node.name === 'string' && typeof node.columnType === 'string') {
      names.push(node.name);
    }

    if (Array.isArray(node.queryChunks)) {
      node.queryChunks.forEach(visit);
    }
  };

  visit(value);

  return names;
}

function getSqlParamValues(value: ExplicitAny): unknown[] {
  const values: unknown[] = [];
  const seen = new Set<object>();

  const visit = (node: ExplicitAny) => {
    if (!node || typeof node !== 'object' || seen.has(node)) return;
    seen.add(node);

    if ('value' in node && 'encoder' in node) {
      values.push(node.value);
    }

    if (Array.isArray(node.queryChunks)) {
      node.queryChunks.forEach(visit);
    }
  };

  visit(value);

  return values;
}

const defaultGetAllInput = { limit: 20, searchTerm: '' };
const defaultGetUserSessionsInput = (userId: string) => ({
  userId,
  limit: 20,
});

describe('user handlers', () => {
  describe('getAll', () => {
    it('should return paginated users with total count', async () => {
      mockDb.select.mockReturnValueOnce(chainResult([{ count: 1 }]));
      mockDb.query.user.findMany.mockResolvedValue([mockUserFromDb]);

      const result = await handlers.getAll(
        createAuthenticatedContext(),
        defaultGetAllInput
      );

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
      mockDb.select.mockReturnValueOnce(chainResult([{ count: 10 }]));
      mockDb.query.user.findMany.mockResolvedValue(usersFromDb);

      const result = await handlers.getAll(createAuthenticatedContext(), {
        ...defaultGetAllInput,
        limit: 3,
      });

      expect(result.items).toHaveLength(3);
      expect(result.nextCursor).toBe('user-4');
      expect(result.total).toBe(10);
    });

    it('should not return nextCursor when items fit within limit', async () => {
      mockDb.select.mockReturnValueOnce(chainResult([{ count: 1 }]));
      mockDb.query.user.findMany.mockResolvedValue([mockUserFromDb]);

      const result = await handlers.getAll(createAuthenticatedContext(), {
        ...defaultGetAllInput,
        limit: 5,
      });

      expect(result.nextCursor).toBeUndefined();
    });

    it('should return an empty page when the cursor no longer exists', async () => {
      mockDb.query.user.findFirst.mockResolvedValue(undefined);
      mockDb.select.mockReturnValueOnce(chainResult([{ count: 10 }]));

      const result = await handlers.getAll(createAuthenticatedContext(), {
        ...defaultGetAllInput,
        cursor: 'deleted-user',
      });

      expect(result).toEqual({
        items: [],
        nextCursor: undefined,
        total: 10,
      });
      expect(mockDb.query.user.findMany).not.toHaveBeenCalled();
    });

    it('should require user list permission', async () => {
      mockDb.select.mockReturnValueOnce(chainResult([{ count: 0 }]));
      mockDb.query.user.findMany.mockResolvedValue([]);

      await handlers.getAll(createAuthenticatedContext(), defaultGetAllInput);

      expect(mockUserHasPermission).toHaveBeenCalledWith({
        body: {
          userId: mockUser.id,
          permissions: { user: ['list'] },
        },
      });
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
    it('should return a user when found', async () => {
      mockDb.query.user.findFirst.mockResolvedValue(mockUserFromDb);

      const result = await handlers.getById(createAuthenticatedContext(), {
        id: 'target-user-1',
      });

      expect(result).toEqual(mockUserFromDb);
    });

    it('should throw NOT_FOUND when user does not exist', async () => {
      mockDb.query.user.findFirst.mockResolvedValue(undefined);

      await expect(
        handlers.getById(createAuthenticatedContext(), { id: 'nonexistent' })
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('should require user list permission', async () => {
      mockDb.query.user.findFirst.mockResolvedValue(mockUserFromDb);

      await handlers.getById(createAuthenticatedContext(), {
        id: 'target-user-1',
      });

      expect(mockUserHasPermission).toHaveBeenCalledWith({
        body: {
          userId: mockUser.id,
          permissions: { user: ['list'] },
        },
      });
    });

    it('should throw FORBIDDEN when user lacks permission', async () => {
      mockUserHasPermission.mockResolvedValue({
        success: false,
        error: false,
      });

      await expect(
        handlers.getById(createAuthenticatedContext(), { id: 'target-user-1' })
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
      mockDb.insert.mockReturnValueOnce(chainResult([createdUser]));

      const result = await handlers.create(
        createAuthenticatedContext(),
        createInput
      );

      expect(result).toEqual(createdUser);
    });

    it('should throw INTERNAL_SERVER_ERROR when no row is returned', async () => {
      mockDb.insert.mockReturnValueOnce(chainResult([]));

      await expect(
        handlers.create(createAuthenticatedContext(), createInput)
      ).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
      });
    });

    it('should require user create permission', async () => {
      mockDb.insert.mockReturnValueOnce(
        chainResult([{ ...mockUserFromDb, ...createInput }])
      );

      await handlers.create(createAuthenticatedContext(), createInput);

      expect(mockUserHasPermission).toHaveBeenCalledWith({
        body: {
          userId: mockUser.id,
          permissions: { user: ['create'] },
        },
      });
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
      id: 'target-user-1',
      name: 'Updated Name',
      email: 'updated@example.com',
      role: 'admin' as const,
    };

    it('should update a user and return it', async () => {
      mockDb.query.user.findFirst.mockResolvedValue({
        email: 'target@example.com',
        role: 'user',
      });
      const updatedUser = { ...mockUserFromDb, ...updateInput };
      mockDb.update.mockReturnValueOnce(chainResult([updatedUser]));

      const result = await handlers.updateById(
        createAuthenticatedContext(),
        updateInput
      );

      expect(result).toEqual(updatedUser);
    });

    it('should prevent changing own role', async () => {
      const selfUpdateInput = {
        id: mockUser.id,
        name: 'New Name',
        email: 'self@example.com',
        role: 'admin' as const,
      };
      mockDb.query.user.findFirst.mockResolvedValue({
        email: 'self@example.com',
        role: 'user',
      });
      const returnedUser = {
        ...mockUserFromDb,
        id: mockUser.id,
        name: 'New Name',
        email: 'self@example.com',
        role: 'user' as const,
      };
      mockDb.update.mockReturnValueOnce(chainResult([returnedUser]));

      const result = await handlers.updateById(
        createAuthenticatedContext(),
        selfUpdateInput
      );

      expect(result.role).toBe('user');
    });

    it('should throw NOT_FOUND when target user does not exist', async () => {
      mockDb.query.user.findFirst.mockResolvedValue(undefined);

      await expect(
        handlers.updateById(createAuthenticatedContext(), updateInput)
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('should throw NOT_FOUND when update returns no row', async () => {
      mockDb.query.user.findFirst.mockResolvedValue({
        email: 'target@example.com',
        role: 'admin',
      });
      mockDb.update.mockReturnValueOnce(chainResult([]));

      await expect(
        handlers.updateById(createAuthenticatedContext(), updateInput)
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('should require user update permission', async () => {
      mockDb.query.user.findFirst.mockResolvedValue({
        email: updateInput.email,
        role: updateInput.role,
      });
      mockDb.update.mockReturnValueOnce(
        chainResult([{ ...mockUserFromDb, ...updateInput }])
      );

      await handlers.updateById(createAuthenticatedContext(), updateInput);

      expect(mockUserHasPermission).toHaveBeenCalledWith({
        body: {
          userId: mockUser.id,
          permissions: { user: ['update'] },
        },
      });
      expect(mockUserHasPermission).toHaveBeenCalledTimes(1);
    });

    it('should require user set-role permission when changing role', async () => {
      mockDb.query.user.findFirst.mockResolvedValue({
        email: 'target@example.com',
        role: 'user',
      });
      mockDb.update.mockReturnValueOnce(
        chainResult([{ ...mockUserFromDb, ...updateInput }])
      );

      await handlers.updateById(createAuthenticatedContext(), updateInput);

      expect(mockUserHasPermission).toHaveBeenNthCalledWith(1, {
        body: {
          userId: mockUser.id,
          permissions: { user: ['update'] },
        },
      });
      expect(mockUserHasPermission).toHaveBeenNthCalledWith(2, {
        body: {
          userId: mockUser.id,
          permissions: { user: ['set-role'] },
        },
      });
    });

    it('should reject role changes when set-role permission is missing', async () => {
      mockUserHasPermission
        .mockResolvedValueOnce({ success: true, error: false })
        .mockResolvedValueOnce({ success: false, error: false });
      mockDb.query.user.findFirst.mockResolvedValue({
        email: 'target@example.com',
        role: 'user',
      });

      await expect(
        handlers.updateById(createAuthenticatedContext(), updateInput)
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it('should mark changed emails as unverified', async () => {
      mockDb.query.user.findFirst.mockResolvedValue({
        email: 'target@example.com',
        role: updateInput.role,
      });
      const updateChain = chainResult([{ ...mockUserFromDb, ...updateInput }]);
      mockDb.update.mockReturnValueOnce(updateChain);

      await handlers.updateById(createAuthenticatedContext(), updateInput);

      expect(updateChain.set).toHaveBeenCalledWith(
        expect.objectContaining({
          emailVerified: false,
        })
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
    it('should delete a user', async () => {
      mockRemoveUser.mockResolvedValue({ success: true });

      await expect(
        handlers.deleteById(createAuthenticatedContext(), {
          id: 'target-user-1',
        })
      ).resolves.toBeUndefined();
    });

    it('should prevent deleting yourself', async () => {
      await expect(
        handlers.deleteById(createAuthenticatedContext(), { id: mockUser.id })
      ).rejects.toMatchObject({
        code: 'BAD_REQUEST',
      });
    });

    it('should throw INTERNAL_SERVER_ERROR when removeUser fails', async () => {
      mockRemoveUser.mockResolvedValue({ success: false });

      await expect(
        handlers.deleteById(createAuthenticatedContext(), {
          id: 'target-user-1',
        })
      ).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
      });
    });

    it('should require user delete permission', async () => {
      mockRemoveUser.mockResolvedValue({ success: true });

      await handlers.deleteById(createAuthenticatedContext(), {
        id: 'target-user-1',
      });

      expect(mockUserHasPermission).toHaveBeenCalledWith({
        body: {
          userId: mockUser.id,
          permissions: { user: ['delete'] },
        },
      });
    });

    it('should throw FORBIDDEN when user lacks permission', async () => {
      mockUserHasPermission.mockResolvedValue({
        success: false,
        error: false,
      });

      await expect(
        handlers.deleteById(createAuthenticatedContext(), {
          id: 'target-user-1',
        })
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });
  });

  describe('getUserSessions', () => {
    it('should return paginated sessions with total count', async () => {
      mockDb.select.mockReturnValueOnce(chainResult([{ count: 1 }]));
      mockDb.query.session.findMany.mockResolvedValue([mockSessionFromDb]);

      const result = await handlers.getUserSessions(
        createAuthenticatedContext(),
        defaultGetUserSessionsInput('target-user-1')
      );

      expect(result).toEqual({
        items: [publicSessionFromDb],
        nextCursor: undefined,
        total: 1,
      });
      expect(mockDb.query.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          columns: {
            id: true,
            createdAt: true,
            updatedAt: true,
            expiresAt: true,
            ipAddress: true,
            userAgent: true,
          },
        })
      );
    });

    it('should not expose raw session tokens in the returned page', async () => {
      mockDb.select.mockReturnValueOnce(chainResult([{ count: 1 }]));
      mockDb.query.session.findMany.mockResolvedValue([mockSessionFromDb]);

      const result = await handlers.getUserSessions(
        createAuthenticatedContext(),
        defaultGetUserSessionsInput('target-user-1')
      );

      expect(result.items[0]).not.toHaveProperty('token');
    });

    it('should return nextCursor when there are more items than limit', async () => {
      const sessions = Array.from({ length: 4 }, (_, i) => ({
        ...mockSessionFromDb,
        id: `session-${i + 1}`,
      }));
      mockDb.select.mockReturnValueOnce(chainResult([{ count: 10 }]));
      mockDb.query.session.findMany.mockResolvedValue(sessions);

      const result = await handlers.getUserSessions(
        createAuthenticatedContext(),
        { userId: 'target-user-1', limit: 3 }
      );

      expect(result.items).toHaveLength(3);
      expect(result.nextCursor).toBe('session-4');
      expect(result.total).toBe(10);
    });

    it('should return an empty page when the session cursor no longer exists', async () => {
      mockDb.query.session.findFirst.mockResolvedValue(undefined);
      mockDb.select.mockReturnValueOnce(chainResult([{ count: 10 }]));

      const result = await handlers.getUserSessions(
        createAuthenticatedContext(),
        {
          userId: 'target-user-1',
          cursor: 'deleted-session',
          limit: 20,
        }
      );

      expect(result).toEqual({
        items: [],
        nextCursor: undefined,
        total: 10,
      });
      expect(mockDb.query.session.findMany).not.toHaveBeenCalled();
    });

    it('should scope session cursor lookup to the requested user', async () => {
      mockDb.query.session.findFirst.mockResolvedValue(mockSessionFromDb);
      mockDb.select.mockReturnValueOnce(chainResult([{ count: 1 }]));
      mockDb.query.session.findMany.mockResolvedValue([mockSessionFromDb]);

      await handlers.getUserSessions(createAuthenticatedContext(), {
        userId: 'target-user-1',
        cursor: 'session-1',
        limit: 20,
      });

      const where = mockDb.query.session.findFirst.mock.calls[0]?.[0].where;

      expect(getSqlColumnNames(where)).toEqual(
        expect.arrayContaining(['id', 'userId'])
      );
      expect(getSqlParamValues(where)).toEqual(
        expect.arrayContaining(['session-1', 'target-user-1'])
      );
    });

    it('should require session list permission', async () => {
      mockDb.select.mockReturnValueOnce(chainResult([{ count: 0 }]));
      mockDb.query.session.findMany.mockResolvedValue([]);

      await handlers.getUserSessions(
        createAuthenticatedContext(),
        defaultGetUserSessionsInput('target-user-1')
      );

      expect(mockUserHasPermission).toHaveBeenCalledWith({
        body: {
          userId: mockUser.id,
          permissions: { session: ['list'] },
        },
      });
    });

    it('should throw FORBIDDEN when user lacks permission', async () => {
      mockUserHasPermission.mockResolvedValue({
        success: false,
        error: false,
      });

      await expect(
        handlers.getUserSessions(
          createAuthenticatedContext(),
          defaultGetUserSessionsInput('target-user-1')
        )
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });
  });

  describe('revokeUserSessions', () => {
    it('should revoke all sessions for a user', async () => {
      mockRevokeUserSessions.mockResolvedValue({ success: true });

      await expect(
        handlers.revokeUserSessions(createAuthenticatedContext(), {
          id: 'target-user-1',
        })
      ).resolves.toBeUndefined();
    });

    it('should prevent revoking own sessions', async () => {
      await expect(
        handlers.revokeUserSessions(createAuthenticatedContext(), {
          id: mockUser.id,
        })
      ).rejects.toMatchObject({
        code: 'BAD_REQUEST',
      });
    });

    it('should throw INTERNAL_SERVER_ERROR when revoke fails', async () => {
      mockRevokeUserSessions.mockResolvedValue({ success: false });

      await expect(
        handlers.revokeUserSessions(createAuthenticatedContext(), {
          id: 'target-user-1',
        })
      ).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
      });
    });

    it('should require session revoke permission', async () => {
      mockRevokeUserSessions.mockResolvedValue({ success: true });

      await handlers.revokeUserSessions(createAuthenticatedContext(), {
        id: 'target-user-1',
      });

      expect(mockUserHasPermission).toHaveBeenCalledWith({
        body: {
          userId: mockUser.id,
          permissions: { session: ['revoke'] },
        },
      });
    });

    it('should throw FORBIDDEN when user lacks permission', async () => {
      mockUserHasPermission.mockResolvedValue({
        success: false,
        error: false,
      });

      await expect(
        handlers.revokeUserSessions(createAuthenticatedContext(), {
          id: 'target-user-1',
        })
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });
  });

  describe('revokeUserSession', () => {
    it('should revoke a specific session', async () => {
      mockDb.query.session.findFirst.mockResolvedValue({
        id: 'session-2',
        token: 'other-token',
      });
      mockRevokeUserSession.mockResolvedValue({ success: true });

      await expect(
        handlers.revokeUserSession(createAuthenticatedContext(), {
          id: 'target-user-1',
          sessionId: 'session-2',
        })
      ).resolves.toBeUndefined();
      expect(mockRevokeUserSession).toHaveBeenCalledWith({
        body: { sessionToken: 'other-token' },
        headers: expect.any(Headers),
      });
    });

    it('should throw NOT_FOUND when the target session does not belong to the user', async () => {
      mockDb.query.session.findFirst.mockResolvedValue(undefined);

      await expect(
        handlers.revokeUserSession(createAuthenticatedContext(), {
          id: 'target-user-1',
          sessionId: 'missing-session',
        })
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
      expect(mockRevokeUserSession).not.toHaveBeenCalled();
    });

    it('should prevent revoking own current session', async () => {
      mockDb.query.session.findFirst.mockResolvedValue({
        id: 'current-session',
        token: 'my-token',
      });

      await expect(
        handlers.revokeUserSession(
          createAuthenticatedContext({
            session: {
              ...mockSession,
              id: 'current-session',
              token: 'my-token',
            } as ExplicitAny,
          }),
          { id: mockUser.id, sessionId: 'current-session' }
        )
      ).rejects.toMatchObject({
        code: 'BAD_REQUEST',
      });
      expect(mockRevokeUserSession).not.toHaveBeenCalled();
    });

    it('should throw INTERNAL_SERVER_ERROR when revoke fails', async () => {
      mockDb.query.session.findFirst.mockResolvedValue({
        id: 'session-2',
        token: 'other-token',
      });
      mockRevokeUserSession.mockResolvedValue({ success: false });

      await expect(
        handlers.revokeUserSession(createAuthenticatedContext(), {
          id: 'target-user-1',
          sessionId: 'session-2',
        })
      ).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
      });
    });

    it('should require session revoke permission', async () => {
      mockDb.query.session.findFirst.mockResolvedValue({
        id: 'session-2',
        token: 'other-token',
      });
      mockRevokeUserSession.mockResolvedValue({ success: true });

      await handlers.revokeUserSession(createAuthenticatedContext(), {
        id: 'target-user-1',
        sessionId: 'session-2',
      });

      expect(mockUserHasPermission).toHaveBeenCalledWith({
        body: {
          userId: mockUser.id,
          permissions: { session: ['revoke'] },
        },
      });
    });

    it('should throw FORBIDDEN when user lacks permission', async () => {
      mockUserHasPermission.mockResolvedValue({
        success: false,
        error: false,
      });

      await expect(
        handlers.revokeUserSession(createAuthenticatedContext(), {
          id: 'target-user-1',
          sessionId: 'session-2',
        })
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });
  });
});
