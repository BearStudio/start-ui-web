import { describe, expect, it, vi } from 'vitest';

import type { Logger } from '@/modules/kernel/application/ports/logger';
import type {
  PermissionChecker,
  PermissionRequest,
} from '@/modules/kernel/application/ports/permission-checker';
import { AppError } from '@/modules/kernel/domain/errors/app-error';
import {
  toEmailAddress,
  toSessionId,
  toUserId,
} from '@/modules/kernel/domain/ids';

import type { UserAuthGateway } from '@/modules/user/application/ports/user-auth-gateway';
import type { UserRepository } from '@/modules/user/application/ports/user-repository';
import type { User } from '@/modules/user/domain/user';
import { createUserUseCases } from '@/modules/user/factory';

const now = new Date('2026-01-01T00:00:00.000Z');
const userId = toUserId('user-1');
const adminId = toUserId('admin-1');
const targetSessionId = toSessionId('session-2');
const currentSessionId = toSessionId('current-session');
const user: User = {
  id: userId,
  name: 'User',
  email: toEmailAddress('user@example.com'),
  emailVerified: true,
  role: 'user',
  image: null,
  createdAt: now,
  updatedAt: now,
  onboardedAt: null,
};

const userListPermission = {
  user: ['list'],
} as const satisfies PermissionRequest;
const userCreatePermission = {
  user: ['create'],
} as const satisfies PermissionRequest;
const userUpdatePermission = {
  user: ['update'],
} as const satisfies PermissionRequest;
const userSetRolePermission = {
  user: ['set-role'],
} as const satisfies PermissionRequest;
const userDeletePermission = {
  user: ['delete'],
} as const satisfies PermissionRequest;
const sessionListPermission = {
  session: ['list'],
} as const satisfies PermissionRequest;
const sessionRevokePermission = {
  session: ['revoke'],
} as const satisfies PermissionRequest;

const scope = (id: string) => ({ userId: toUserId(id), role: 'user' }) as const;

function samePermissionRequest(
  expected: PermissionRequest,
  actual: PermissionRequest
) {
  const expectedEntries = Object.entries(expected);
  const actualEntries = Object.entries(actual);
  return (
    expectedEntries.length === actualEntries.length &&
    expectedEntries.every(([resource, actions]) => {
      const actualActions = actual[resource];
      return (
        actualActions !== undefined &&
        actions.length === actualActions.length &&
        actions.every((action, index) => action === actualActions[index])
      );
    })
  );
}

function makePermissionChecker(
  ...allowedRequests: PermissionRequest[]
): PermissionChecker {
  return {
    hasPermission: vi.fn<PermissionChecker['hasPermission']>(
      async (_userId, permissions) =>
        allowedRequests.some((request) =>
          samePermissionRequest(request, permissions)
        )
    ),
  };
}

function makeLogger(): Logger {
  return {
    debug: vi.fn<Logger['debug']>(),
    info: vi.fn<Logger['info']>(),
    warn: vi.fn<Logger['warn']>(),
    error: vi.fn<Logger['error']>(),
  };
}

function makeRepo(overrides: Partial<UserRepository> = {}) {
  const repo = {
    list: vi.fn<UserRepository['list']>(async () => ({
      items: [user],
      total: 1,
    })),
    getById: vi.fn<UserRepository['getById']>(async () => user),
    create: vi.fn<UserRepository['create']>(async (input) => ({
      ...user,
      name: input.name ?? user.name,
      email: input.email,
      role: input.role ?? user.role,
    })),
    getUpdateSnapshot: vi.fn<UserRepository['getUpdateSnapshot']>(async () => ({
      email: toEmailAddress('old@example.com'),
      role: 'user',
    })),
    update: vi.fn<UserRepository['update']>(async (_id, input) => ({
      ...user,
      name: input.name ?? user.name,
      email: input.email,
      role: input.role ?? user.role,
      emailVerified: input.emailVerified ?? user.emailVerified,
    })),
    listSessions: vi.fn<UserRepository['listSessions']>(async () => ({
      items: [
        {
          id: targetSessionId,
          createdAt: now,
          updatedAt: now,
          expiresAt: now,
          ipAddress: null,
          userAgent: null,
        },
      ],
      total: 1,
    })),
    findSessionForRevocation: vi.fn<UserRepository['findSessionForRevocation']>(
      async () => ({
        id: targetSessionId,
        providerToken: 'session-token',
      })
    ),
  };

  return Object.assign(repo, overrides);
}

function makeAuthGateway(overrides: Partial<UserAuthGateway> = {}) {
  const gateway = {
    removeUser: vi.fn<UserAuthGateway['removeUser']>(async () => true),
    revokeUserSessions: vi.fn<UserAuthGateway['revokeUserSessions']>(
      async () => true
    ),
    revokeUserSession: vi.fn<UserAuthGateway['revokeUserSession']>(
      async () => true
    ),
  };

  return Object.assign(gateway, overrides);
}

function makeContext(
  overrides: {
    repo?: Partial<UserRepository>;
    permissionChecker?: PermissionChecker;
    auth?: Partial<UserAuthGateway>;
  } = {}
) {
  const repo = makeRepo(overrides.repo);
  const auth = makeAuthGateway(overrides.auth);
  const permissionChecker =
    overrides.permissionChecker ?? makePermissionChecker();
  const logger = makeLogger();
  const useCases = createUserUseCases({
    userRepository: repo,
    userAuthGateway: auth,
    permissionChecker,
    logger,
  });

  return { useCases, repo, auth, permissionChecker, logger };
}

function appError(code: string) {
  return new AppError({
    code,
    category: 'conflict',
    status: 409,
  });
}

describe('user use cases', () => {
  describe('list', () => {
    it('lists users after checking the exact user list permission', async () => {
      const cursor = toUserId('cursor-1');
      const { useCases, repo, permissionChecker, logger } = makeContext({
        permissionChecker: makePermissionChecker(userListPermission),
      });

      await expect(
        useCases.list({
          scope: scope('admin-1'),
          cursor,
          limit: 20,
          searchTerm: 'alice',
        })
      ).resolves.toEqual({ ok: true, value: { items: [user], total: 1 } });

      expect(permissionChecker.hasPermission).toHaveBeenCalledWith(
        adminId,
        userListPermission
      );
      expect(repo.list).toHaveBeenCalledWith({
        cursor,
        limit: 20,
        searchTerm: 'alice',
      });
      expect(logger.info).toHaveBeenCalledWith({ event: 'user.list' });
    });

    it('does not list users without permission', async () => {
      const { useCases, repo, logger } = makeContext({
        permissionChecker: makePermissionChecker(),
      });

      await expect(
        useCases.list({
          scope: scope('admin-1'),
          limit: 20,
          searchTerm: '',
        })
      ).resolves.toEqual({ ok: false, reason: 'forbidden' });

      expect(repo.list).not.toHaveBeenCalled();
      expect(logger.info).not.toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('gets a user after checking the exact user list permission', async () => {
      const { useCases, repo, permissionChecker, logger } = makeContext({
        permissionChecker: makePermissionChecker(userListPermission),
      });

      await expect(
        useCases.get({ scope: scope('admin-1'), id: userId })
      ).resolves.toEqual({ ok: true, value: user });

      expect(permissionChecker.hasPermission).toHaveBeenCalledWith(
        adminId,
        userListPermission
      );
      expect(repo.getById).toHaveBeenCalledWith(userId);
      expect(logger.info).toHaveBeenCalledWith({
        event: 'user.get',
        details: { userId },
      });
    });

    it('does not get users without permission', async () => {
      const { useCases, repo, logger } = makeContext({
        permissionChecker: makePermissionChecker(),
      });

      await expect(
        useCases.get({ scope: scope('admin-1'), id: userId })
      ).resolves.toEqual({ ok: false, reason: 'forbidden' });

      expect(repo.getById).not.toHaveBeenCalled();
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('returns not_found when the user row is missing', async () => {
      const { useCases } = makeContext({
        permissionChecker: makePermissionChecker(userListPermission),
        repo: { getById: vi.fn<UserRepository['getById']>(async () => null) },
      });

      await expect(
        useCases.get({ scope: scope('admin-1'), id: toUserId('missing') })
      ).resolves.toEqual({ ok: false, reason: 'not_found' });
    });
  });

  describe('create', () => {
    it('creates users after checking the exact create permission', async () => {
      const input = {
        name: 'New User',
        email: toEmailAddress('new@example.com'),
        role: 'admin' as const,
      };
      const { useCases, repo, permissionChecker, logger } = makeContext({
        permissionChecker: makePermissionChecker(userCreatePermission),
      });

      await expect(
        useCases.create({ scope: scope('admin-1'), user: input })
      ).resolves.toMatchObject({
        ok: true,
        value: {
          name: 'New User',
          email: toEmailAddress('new@example.com'),
          role: 'admin',
        },
      });

      expect(permissionChecker.hasPermission).toHaveBeenCalledWith(
        adminId,
        userCreatePermission
      );
      expect(repo.create).toHaveBeenCalledWith(input);
      expect(logger.info).toHaveBeenCalledWith({ event: 'user.create' });
    });

    it('does not create users without permission', async () => {
      const { useCases, repo, logger } = makeContext({
        permissionChecker: makePermissionChecker(),
      });

      await expect(
        useCases.create({
          scope: scope('admin-1'),
          user: { email: toEmailAddress('new@example.com'), role: 'user' },
        })
      ).resolves.toEqual({ ok: false, reason: 'forbidden' });

      expect(repo.create).not.toHaveBeenCalled();
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('maps duplicate email conflicts', async () => {
      const { useCases } = makeContext({
        permissionChecker: makePermissionChecker(userCreatePermission),
        repo: {
          create: vi.fn<UserRepository['create']>(async () => {
            throw appError('USER_DUPLICATE');
          }),
        },
      });

      await expect(
        useCases.create({
          scope: scope('admin-1'),
          user: { email: toEmailAddress('user@example.com'), role: 'user' },
        })
      ).resolves.toEqual({ ok: false, reason: 'duplicate' });
    });

    it('rethrows non-duplicate create conflicts', async () => {
      const { useCases } = makeContext({
        permissionChecker: makePermissionChecker(userCreatePermission),
        repo: {
          create: vi.fn<UserRepository['create']>(async () => {
            throw appError('OTHER_CONFLICT');
          }),
        },
      });

      await expect(
        useCases.create({
          scope: scope('admin-1'),
          user: { email: toEmailAddress('user@example.com'), role: 'user' },
        })
      ).rejects.toMatchObject({ code: 'OTHER_CONFLICT' });
    });
  });

  describe('update', () => {
    it('does not load snapshots without update permission', async () => {
      const { useCases, repo } = makeContext({
        permissionChecker: makePermissionChecker(),
      });

      await expect(
        useCases.update({
          scope: scope('admin-1'),
          id: userId,
          user: { email: toEmailAddress('next@example.com') },
        })
      ).resolves.toEqual({ ok: false, reason: 'forbidden' });

      expect(repo.getUpdateSnapshot).not.toHaveBeenCalled();
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('returns not_found when the update snapshot is missing', async () => {
      const { useCases, repo } = makeContext({
        permissionChecker: makePermissionChecker(userUpdatePermission),
        repo: {
          getUpdateSnapshot: vi.fn<UserRepository['getUpdateSnapshot']>(
            async () => null
          ),
        },
      });

      await expect(
        useCases.update({
          scope: scope('admin-1'),
          id: toUserId('missing'),
          user: { email: toEmailAddress('next@example.com') },
        })
      ).resolves.toEqual({ ok: false, reason: 'not_found' });

      expect(repo.update).not.toHaveBeenCalled();
    });

    it('updates self without applying submitted role changes', async () => {
      const nextEmail = toEmailAddress('next@example.com');
      const { useCases, repo, permissionChecker, logger } = makeContext({
        permissionChecker: makePermissionChecker(userUpdatePermission),
      });

      await expect(
        useCases.update({
          scope: scope('user-1'),
          id: userId,
          user: { email: nextEmail, role: 'admin' },
        })
      ).resolves.toMatchObject({
        ok: true,
        value: { email: nextEmail, role: 'user', emailVerified: false },
      });

      expect(permissionChecker.hasPermission).toHaveBeenCalledTimes(1);
      expect(permissionChecker.hasPermission).toHaveBeenCalledWith(
        userId,
        userUpdatePermission
      );
      expect(repo.update).toHaveBeenCalledWith(userId, {
        email: nextEmail,
        role: undefined,
        emailVerified: false,
      });
      expect(logger.info).toHaveBeenCalledWith({
        event: 'user.update',
        details: { userId },
      });
    });

    it('requires set-role permission before changing another user role', async () => {
      const { useCases, repo, permissionChecker } = makeContext({
        permissionChecker: makePermissionChecker(
          userUpdatePermission,
          userSetRolePermission
        ),
        repo: {
          getUpdateSnapshot: vi.fn<UserRepository['getUpdateSnapshot']>(
            async () => ({
              email: user.email,
              role: 'user',
            })
          ),
        },
      });

      await expect(
        useCases.update({
          scope: scope('admin-1'),
          id: userId,
          user: {
            name: 'Updated User',
            email: user.email,
            role: 'admin',
          },
        })
      ).resolves.toMatchObject({
        ok: true,
        value: { name: 'Updated User', role: 'admin', emailVerified: true },
      });

      expect(permissionChecker.hasPermission).toHaveBeenNthCalledWith(
        1,
        adminId,
        userUpdatePermission
      );
      expect(permissionChecker.hasPermission).toHaveBeenNthCalledWith(
        2,
        adminId,
        userSetRolePermission
      );
      expect(repo.update).toHaveBeenCalledWith(userId, {
        email: user.email,
        role: 'admin',
        emailVerified: undefined,
        name: 'Updated User',
      });
    });

    it('does not update another user role when set-role is denied', async () => {
      const { useCases, repo, permissionChecker } = makeContext({
        permissionChecker: makePermissionChecker(userUpdatePermission),
        repo: {
          getUpdateSnapshot: vi.fn<UserRepository['getUpdateSnapshot']>(
            async () => ({
              email: user.email,
              role: 'user',
            })
          ),
        },
      });

      await expect(
        useCases.update({
          scope: scope('admin-1'),
          id: userId,
          user: { email: user.email, role: 'admin' },
        })
      ).resolves.toEqual({ ok: false, reason: 'forbidden' });

      expect(permissionChecker.hasPermission).toHaveBeenCalledTimes(2);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('does not require set-role when the requested role is unchanged', async () => {
      const { useCases, repo, permissionChecker } = makeContext({
        permissionChecker: makePermissionChecker(userUpdatePermission),
        repo: {
          getUpdateSnapshot: vi.fn<UserRepository['getUpdateSnapshot']>(
            async () => ({
              email: user.email,
              role: 'user',
            })
          ),
        },
      });

      await expect(
        useCases.update({
          scope: scope('admin-1'),
          id: userId,
          user: { email: user.email, role: 'user' },
        })
      ).resolves.toMatchObject({ ok: true, value: { role: 'user' } });

      expect(permissionChecker.hasPermission).toHaveBeenCalledTimes(1);
      expect(repo.update).toHaveBeenCalledWith(userId, {
        email: user.email,
        role: 'user',
        emailVerified: undefined,
      });
    });

    it('normalizes a null display name to an empty string', async () => {
      const { useCases, repo } = makeContext({
        permissionChecker: makePermissionChecker(userUpdatePermission),
        repo: {
          getUpdateSnapshot: vi.fn<UserRepository['getUpdateSnapshot']>(
            async () => ({
              email: user.email,
              role: 'user',
            })
          ),
        },
      });

      await expect(
        useCases.update({
          scope: scope('admin-1'),
          id: userId,
          user: { name: null, email: user.email },
        })
      ).resolves.toMatchObject({ ok: true, value: { name: '' } });

      expect(repo.update).toHaveBeenCalledWith(userId, {
        email: user.email,
        role: undefined,
        emailVerified: undefined,
        name: '',
      });
    });

    it('returns not_found when the update write misses after a snapshot', async () => {
      const { useCases } = makeContext({
        permissionChecker: makePermissionChecker(userUpdatePermission),
        repo: { update: vi.fn<UserRepository['update']>(async () => null) },
      });

      await expect(
        useCases.update({
          scope: scope('admin-1'),
          id: userId,
          user: { email: user.email },
        })
      ).resolves.toEqual({ ok: false, reason: 'not_found' });
    });

    it('maps duplicate email conflicts', async () => {
      const { useCases } = makeContext({
        permissionChecker: makePermissionChecker(userUpdatePermission),
        repo: {
          update: vi.fn<UserRepository['update']>(async () => {
            throw appError('USER_DUPLICATE');
          }),
        },
      });

      await expect(
        useCases.update({
          scope: scope('admin-1'),
          id: userId,
          user: { email: toEmailAddress('duplicate@example.com') },
        })
      ).resolves.toEqual({ ok: false, reason: 'duplicate' });
    });

    it('rethrows non-duplicate update conflicts', async () => {
      const { useCases } = makeContext({
        permissionChecker: makePermissionChecker(userUpdatePermission),
        repo: {
          update: vi.fn<UserRepository['update']>(async () => {
            throw appError('OTHER_CONFLICT');
          }),
        },
      });

      await expect(
        useCases.update({
          scope: scope('admin-1'),
          id: userId,
          user: { email: toEmailAddress('duplicate@example.com') },
        })
      ).rejects.toMatchObject({ code: 'OTHER_CONFLICT' });
    });
  });

  describe('delete', () => {
    it('deletes another user after checking the exact delete permission', async () => {
      const { useCases, auth, permissionChecker, logger } = makeContext({
        permissionChecker: makePermissionChecker(userDeletePermission),
      });

      await expect(
        useCases.delete({ scope: scope('admin-1'), id: userId })
      ).resolves.toEqual({ ok: true, value: undefined });

      expect(permissionChecker.hasPermission).toHaveBeenCalledWith(
        adminId,
        userDeletePermission
      );
      expect(auth.removeUser).toHaveBeenCalledWith(userId);
      expect(logger.info).toHaveBeenCalledWith({
        event: 'user.delete',
        details: { userId },
      });
    });

    it('does not delete users without permission', async () => {
      const { useCases, auth, logger } = makeContext({
        permissionChecker: makePermissionChecker(),
      });

      await expect(
        useCases.delete({ scope: scope('admin-1'), id: userId })
      ).resolves.toEqual({ ok: false, reason: 'forbidden' });

      expect(auth.removeUser).not.toHaveBeenCalled();
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('does not delete the current user', async () => {
      const { useCases, auth } = makeContext({
        permissionChecker: makePermissionChecker(userDeletePermission),
      });

      await expect(
        useCases.delete({ scope: scope('user-1'), id: userId })
      ).resolves.toEqual({ ok: false, reason: 'self' });

      expect(auth.removeUser).not.toHaveBeenCalled();
    });

    it('throws when the auth provider cannot delete the user', async () => {
      const { useCases } = makeContext({
        permissionChecker: makePermissionChecker(userDeletePermission),
        auth: {
          removeUser: vi.fn<UserAuthGateway['removeUser']>(async () => false),
        },
      });

      await expect(
        useCases.delete({ scope: scope('admin-1'), id: userId })
      ).rejects.toMatchObject({
        code: 'USER_DELETE_FAILED',
        message: 'Failed to delete user',
      });
    });
  });

  describe('listSessions', () => {
    it('lists sessions after checking the exact session list permission', async () => {
      const cursor = toSessionId('cursor-session');
      const { useCases, repo, permissionChecker, logger } = makeContext({
        permissionChecker: makePermissionChecker(sessionListPermission),
      });

      await expect(
        useCases.listSessions({
          scope: scope('admin-1'),
          userId,
          cursor,
          limit: 10,
        })
      ).resolves.toEqual({
        ok: true,
        value: {
          items: [
            {
              id: targetSessionId,
              createdAt: now,
              updatedAt: now,
              expiresAt: now,
              ipAddress: null,
              userAgent: null,
            },
          ],
          total: 1,
        },
      });

      expect(permissionChecker.hasPermission).toHaveBeenCalledWith(
        adminId,
        sessionListPermission
      );
      expect(repo.listSessions).toHaveBeenCalledWith({
        userId,
        cursor,
        limit: 10,
      });
      expect(logger.info).toHaveBeenCalledWith({
        event: 'user.sessions.list',
        details: { userId },
      });
    });

    it('does not list sessions without permission', async () => {
      const { useCases, repo, logger } = makeContext({
        permissionChecker: makePermissionChecker(),
      });

      await expect(
        useCases.listSessions({
          scope: scope('admin-1'),
          userId,
          limit: 10,
        })
      ).resolves.toEqual({ ok: false, reason: 'forbidden' });

      expect(repo.listSessions).not.toHaveBeenCalled();
      expect(logger.info).not.toHaveBeenCalled();
    });
  });

  describe('revokeSessions', () => {
    it('revokes all sessions for another user after checking revoke permission', async () => {
      const { useCases, auth, permissionChecker } = makeContext({
        permissionChecker: makePermissionChecker(sessionRevokePermission),
      });

      await expect(
        useCases.revokeSessions({ scope: scope('admin-1'), id: userId })
      ).resolves.toEqual({ ok: true, value: undefined });

      expect(permissionChecker.hasPermission).toHaveBeenCalledWith(
        adminId,
        sessionRevokePermission
      );
      expect(auth.revokeUserSessions).toHaveBeenCalledWith(userId);
    });

    it('does not revoke sessions without permission', async () => {
      const { useCases, auth } = makeContext({
        permissionChecker: makePermissionChecker(),
      });

      await expect(
        useCases.revokeSessions({ scope: scope('admin-1'), id: userId })
      ).resolves.toEqual({ ok: false, reason: 'forbidden' });

      expect(auth.revokeUserSessions).not.toHaveBeenCalled();
    });

    it('does not revoke the current user sessions through the admin flow', async () => {
      const { useCases, auth } = makeContext({
        permissionChecker: makePermissionChecker(sessionRevokePermission),
      });

      await expect(
        useCases.revokeSessions({ scope: scope('user-1'), id: userId })
      ).resolves.toEqual({ ok: false, reason: 'self' });

      expect(auth.revokeUserSessions).not.toHaveBeenCalled();
    });

    it('throws when the auth provider cannot revoke all sessions', async () => {
      const { useCases } = makeContext({
        permissionChecker: makePermissionChecker(sessionRevokePermission),
        auth: {
          revokeUserSessions: vi.fn<UserAuthGateway['revokeUserSessions']>(
            async () => false
          ),
        },
      });

      await expect(
        useCases.revokeSessions({ scope: scope('admin-1'), id: userId })
      ).rejects.toMatchObject({
        code: 'USER_SESSIONS_REVOKE_FAILED',
        message: 'Failed to revoke user sessions',
      });
    });
  });

  describe('revokeSession', () => {
    it('revokes one resolved provider session token', async () => {
      const { useCases, repo, auth, permissionChecker } = makeContext({
        permissionChecker: makePermissionChecker(sessionRevokePermission),
      });

      await expect(
        useCases.revokeSession({
          scope: scope('admin-1'),
          currentSessionId,
          id: userId,
          sessionId: targetSessionId,
        })
      ).resolves.toEqual({ ok: true, value: undefined });

      expect(permissionChecker.hasPermission).toHaveBeenCalledWith(
        adminId,
        sessionRevokePermission
      );
      expect(repo.findSessionForRevocation).toHaveBeenCalledWith({
        userId,
        sessionId: targetSessionId,
      });
      expect(auth.revokeUserSession).toHaveBeenCalledWith({
        id: targetSessionId,
        providerToken: 'session-token',
      });
    });

    it('does not revoke one session without permission', async () => {
      const { useCases, repo, auth } = makeContext({
        permissionChecker: makePermissionChecker(),
      });

      await expect(
        useCases.revokeSession({
          scope: scope('admin-1'),
          currentSessionId,
          id: userId,
          sessionId: targetSessionId,
        })
      ).resolves.toEqual({ ok: false, reason: 'forbidden' });

      expect(repo.findSessionForRevocation).not.toHaveBeenCalled();
      expect(auth.revokeUserSession).not.toHaveBeenCalled();
    });

    it('returns not_found when the session cannot be resolved', async () => {
      const { useCases, auth } = makeContext({
        permissionChecker: makePermissionChecker(sessionRevokePermission),
        repo: {
          findSessionForRevocation: vi.fn<
            UserRepository['findSessionForRevocation']
          >(async () => null),
        },
      });

      await expect(
        useCases.revokeSession({
          scope: scope('admin-1'),
          currentSessionId,
          id: userId,
          sessionId: targetSessionId,
        })
      ).resolves.toEqual({ ok: false, reason: 'not_found' });

      expect(auth.revokeUserSession).not.toHaveBeenCalled();
    });

    it('does not revoke the current browser session', async () => {
      const { useCases, auth } = makeContext({
        permissionChecker: makePermissionChecker(sessionRevokePermission),
      });

      await expect(
        useCases.revokeSession({
          scope: scope('admin-1'),
          currentSessionId: targetSessionId,
          id: userId,
          sessionId: targetSessionId,
        })
      ).resolves.toEqual({ ok: false, reason: 'self' });

      expect(auth.revokeUserSession).not.toHaveBeenCalled();
    });

    it('throws when the auth provider cannot revoke the session', async () => {
      const { useCases } = makeContext({
        permissionChecker: makePermissionChecker(sessionRevokePermission),
        auth: {
          revokeUserSession: vi.fn<UserAuthGateway['revokeUserSession']>(
            async () => false
          ),
        },
      });

      await expect(
        useCases.revokeSession({
          scope: scope('admin-1'),
          currentSessionId,
          id: userId,
          sessionId: targetSessionId,
        })
      ).rejects.toMatchObject({
        code: 'USER_SESSION_REVOKE_FAILED',
        message: 'Failed to revoke user session',
      });
    });
  });
});
