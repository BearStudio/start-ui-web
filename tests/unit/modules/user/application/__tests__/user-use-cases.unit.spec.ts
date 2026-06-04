import { Result } from '@swan-io/boxed';
import { describe, expect, it, vi } from 'vitest';

import type {
  Logger,
  PermissionChecker,
  PermissionRequest,
} from '@/modules/kernel';
import {
  AppError,
  toEmailAddress,
  toSessionId,
  toUserId,
} from '@/modules/kernel';
import type { ApplicationResult } from '@/modules/kernel/testing';
import {
  createUserUseCases,
  type User,
  type UserAuthGateway,
  type UserRepository,
} from '@/modules/user/testing';

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
      async (_userId, permissions) => {
        const allowed = allowedRequests.some((request) =>
          samePermissionRequest(request, permissions)
        );
        return Result.Ok({
          type: allowed ? 'permission_granted' : 'permission_denied',
        });
      }
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
    list: vi.fn<UserRepository['list']>(async () =>
      Result.Ok({
        type: 'user_listed',
        page: {
          items: [user],
          total: 1,
        },
      })
    ),
    getById: vi.fn<UserRepository['getById']>(async () =>
      Result.Ok({ type: 'user_found', user })
    ),
    create: vi.fn<UserRepository['create']>(async (input) =>
      Result.Ok({
        type: 'user_created',
        user: {
          ...user,
          name: input.name ?? user.name,
          email: input.email,
          role: input.role ?? user.role,
        },
      })
    ),
    getUpdateSnapshot: vi.fn<UserRepository['getUpdateSnapshot']>(async () =>
      Result.Ok({
        type: 'user_update_snapshot_found',
        snapshot: {
          email: toEmailAddress('old@example.com'),
          role: 'user',
        },
      })
    ),
    update: vi.fn<UserRepository['update']>(async (_id, input) =>
      Result.Ok({
        type: 'user_updated',
        user: {
          ...user,
          name: input.name ?? user.name,
          email: input.email,
          role: input.role ?? user.role,
          emailVerified: input.emailVerified ?? user.emailVerified,
        },
      })
    ),
    listSessions: vi.fn<UserRepository['listSessions']>(async () =>
      Result.Ok({
        type: 'user_sessions_listed',
        page: {
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
      })
    ),
    findSessionForRevocation: vi.fn<UserRepository['findSessionForRevocation']>(
      async () =>
        Result.Ok({
          type: 'user_session_revocation_target_found',
          target: { id: targetSessionId },
        })
    ),
  };

  return Object.assign(repo, overrides);
}

function makeAuthGateway(overrides: Partial<UserAuthGateway> = {}) {
  const gateway = {
    removeUser: vi.fn<UserAuthGateway['removeUser']>(async () =>
      Result.Ok({ type: 'user_auth_removed' })
    ),
    revokeUserSessions: vi.fn<UserAuthGateway['revokeUserSessions']>(async () =>
      Result.Ok({ type: 'user_auth_sessions_revoked' })
    ),
    revokeUserSession: vi.fn<UserAuthGateway['revokeUserSession']>(async () =>
      Result.Ok({ type: 'user_auth_session_revoked' })
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

async function expectOk<TOutcome extends { type: string }>(
  promise: Promise<ApplicationResult<TOutcome>>
) {
  const result = await promise;
  if (result.isError()) throw result.getError();
  return result.get();
}

async function expectFailure<TOutcome extends { type: string }>(
  promise: Promise<ApplicationResult<TOutcome>>
) {
  const result = await promise;
  if (result.isOk()) {
    throw new Error(`Expected Result.Error, got ${result.get().type}`);
  }
  return result.getError();
}

describe('user use cases', () => {
  describe('list', () => {
    it('lists users after checking the exact user list permission', async () => {
      const cursor = toUserId('cursor-1');
      const { useCases, repo, permissionChecker, logger } = makeContext({
        permissionChecker: makePermissionChecker(userListPermission),
      });

      await expect(
        expectOk(
          useCases.list({
            currentUserId: adminId,
            cursor,
            limit: 20,
            searchTerm: 'alice',
          })
        )
      ).resolves.toEqual({
        type: 'user_listed',
        page: { items: [user], total: 1 },
      });

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
        expectOk(
          useCases.list({
            currentUserId: adminId,
            limit: 20,
            searchTerm: '',
          })
        )
      ).resolves.toEqual({ type: 'user_forbidden' });

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
        expectOk(useCases.get({ currentUserId: adminId, id: userId }))
      ).resolves.toEqual({ type: 'user_found', user });

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
        expectOk(useCases.get({ currentUserId: adminId, id: userId }))
      ).resolves.toEqual({ type: 'user_forbidden' });

      expect(repo.getById).not.toHaveBeenCalled();
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('returns not_found when the user row is missing', async () => {
      const { useCases } = makeContext({
        permissionChecker: makePermissionChecker(userListPermission),
        repo: {
          getById: vi.fn<UserRepository['getById']>(async () =>
            Result.Ok({ type: 'user_not_found' })
          ),
        },
      });

      await expect(
        expectOk(
          useCases.get({ currentUserId: adminId, id: toUserId('missing') })
        )
      ).resolves.toEqual({ type: 'user_not_found' });
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
        expectOk(useCases.create({ currentUserId: adminId, user: input }))
      ).resolves.toMatchObject({
        type: 'user_created',
        user: {
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
        expectOk(
          useCases.create({
            currentUserId: adminId,
            user: { email: toEmailAddress('new@example.com'), role: 'user' },
          })
        )
      ).resolves.toEqual({ type: 'user_forbidden' });

      expect(repo.create).not.toHaveBeenCalled();
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('maps duplicate email conflicts', async () => {
      const { useCases } = makeContext({
        permissionChecker: makePermissionChecker(userCreatePermission),
        repo: {
          create: vi.fn<UserRepository['create']>(async () =>
            Result.Ok({ type: 'user_duplicate' })
          ),
        },
      });

      await expect(
        expectOk(
          useCases.create({
            currentUserId: adminId,
            user: { email: toEmailAddress('user@example.com'), role: 'user' },
          })
        )
      ).resolves.toEqual({ type: 'user_duplicate' });
    });

    it('returns non-duplicate create conflicts as app errors', async () => {
      const { useCases } = makeContext({
        permissionChecker: makePermissionChecker(userCreatePermission),
        repo: {
          create: vi.fn<UserRepository['create']>(async () =>
            Result.Error(appError('OTHER_CONFLICT'))
          ),
        },
      });

      await expect(
        expectFailure(
          useCases.create({
            currentUserId: adminId,
            user: { email: toEmailAddress('user@example.com'), role: 'user' },
          })
        )
      ).resolves.toMatchObject({ code: 'OTHER_CONFLICT' });
    });
  });

  describe('update', () => {
    it('does not load snapshots without update permission', async () => {
      const { useCases, repo } = makeContext({
        permissionChecker: makePermissionChecker(),
      });

      await expect(
        expectOk(
          useCases.update({
            currentUserId: adminId,
            id: userId,
            user: { email: toEmailAddress('next@example.com') },
          })
        )
      ).resolves.toEqual({ type: 'user_forbidden' });

      expect(repo.getUpdateSnapshot).not.toHaveBeenCalled();
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('returns not_found when the update snapshot is missing', async () => {
      const { useCases, repo } = makeContext({
        permissionChecker: makePermissionChecker(userUpdatePermission),
        repo: {
          getUpdateSnapshot: vi.fn<UserRepository['getUpdateSnapshot']>(
            async () => Result.Ok({ type: 'user_not_found' })
          ),
        },
      });

      await expect(
        expectOk(
          useCases.update({
            currentUserId: adminId,
            id: toUserId('missing'),
            user: { email: toEmailAddress('next@example.com') },
          })
        )
      ).resolves.toEqual({ type: 'user_not_found' });

      expect(repo.update).not.toHaveBeenCalled();
    });

    it('updates self without applying submitted role changes', async () => {
      const nextEmail = toEmailAddress('next@example.com');
      const { useCases, repo, permissionChecker, logger } = makeContext({
        permissionChecker: makePermissionChecker(userUpdatePermission),
      });

      await expect(
        expectOk(
          useCases.update({
            currentUserId: userId,
            id: userId,
            user: { email: nextEmail, role: 'admin' },
          })
        )
      ).resolves.toMatchObject({
        type: 'user_updated',
        user: { email: nextEmail, role: 'user', emailVerified: false },
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
            async () =>
              Result.Ok({
                type: 'user_update_snapshot_found',
                snapshot: {
                  email: user.email,
                  role: 'user',
                },
              })
          ),
        },
      });

      await expect(
        expectOk(
          useCases.update({
            currentUserId: adminId,
            id: userId,
            user: {
              name: 'Updated User',
              email: user.email,
              role: 'admin',
            },
          })
        )
      ).resolves.toMatchObject({
        type: 'user_updated',
        user: { name: 'Updated User', role: 'admin', emailVerified: true },
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
            async () =>
              Result.Ok({
                type: 'user_update_snapshot_found',
                snapshot: {
                  email: user.email,
                  role: 'user',
                },
              })
          ),
        },
      });

      await expect(
        expectOk(
          useCases.update({
            currentUserId: adminId,
            id: userId,
            user: { email: user.email, role: 'admin' },
          })
        )
      ).resolves.toEqual({ type: 'user_forbidden' });

      expect(permissionChecker.hasPermission).toHaveBeenCalledTimes(2);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('does not require set-role when the requested role is unchanged', async () => {
      const { useCases, repo, permissionChecker } = makeContext({
        permissionChecker: makePermissionChecker(userUpdatePermission),
        repo: {
          getUpdateSnapshot: vi.fn<UserRepository['getUpdateSnapshot']>(
            async () =>
              Result.Ok({
                type: 'user_update_snapshot_found',
                snapshot: {
                  email: user.email,
                  role: 'user',
                },
              })
          ),
        },
      });

      await expect(
        expectOk(
          useCases.update({
            currentUserId: adminId,
            id: userId,
            user: { email: user.email, role: 'user' },
          })
        )
      ).resolves.toMatchObject({
        type: 'user_updated',
        user: { role: 'user' },
      });

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
            async () =>
              Result.Ok({
                type: 'user_update_snapshot_found',
                snapshot: {
                  email: user.email,
                  role: 'user',
                },
              })
          ),
        },
      });

      await expect(
        expectOk(
          useCases.update({
            currentUserId: adminId,
            id: userId,
            user: { name: null, email: user.email },
          })
        )
      ).resolves.toMatchObject({
        type: 'user_updated',
        user: { name: '' },
      });

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
        repo: {
          update: vi.fn<UserRepository['update']>(async () =>
            Result.Ok({ type: 'user_not_found' })
          ),
        },
      });

      await expect(
        expectOk(
          useCases.update({
            currentUserId: adminId,
            id: userId,
            user: { email: user.email },
          })
        )
      ).resolves.toEqual({ type: 'user_not_found' });
    });

    it('maps duplicate email conflicts', async () => {
      const { useCases } = makeContext({
        permissionChecker: makePermissionChecker(userUpdatePermission),
        repo: {
          update: vi.fn<UserRepository['update']>(async () =>
            Result.Ok({ type: 'user_duplicate' })
          ),
        },
      });

      await expect(
        expectOk(
          useCases.update({
            currentUserId: adminId,
            id: userId,
            user: { email: toEmailAddress('duplicate@example.com') },
          })
        )
      ).resolves.toEqual({ type: 'user_duplicate' });
    });

    it('returns non-duplicate update conflicts as app errors', async () => {
      const { useCases } = makeContext({
        permissionChecker: makePermissionChecker(userUpdatePermission),
        repo: {
          update: vi.fn<UserRepository['update']>(async () =>
            Result.Error(appError('OTHER_CONFLICT'))
          ),
        },
      });

      await expect(
        expectFailure(
          useCases.update({
            currentUserId: adminId,
            id: userId,
            user: { email: toEmailAddress('duplicate@example.com') },
          })
        )
      ).resolves.toMatchObject({ code: 'OTHER_CONFLICT' });
    });
  });

  describe('delete', () => {
    it('deletes another user after checking the exact delete permission', async () => {
      const { useCases, auth, permissionChecker, logger } = makeContext({
        permissionChecker: makePermissionChecker(userDeletePermission),
      });

      await expect(
        expectOk(useCases.delete({ currentUserId: adminId, id: userId }))
      ).resolves.toEqual({ type: 'user_deleted' });

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
        expectOk(useCases.delete({ currentUserId: adminId, id: userId }))
      ).resolves.toEqual({ type: 'user_forbidden' });

      expect(auth.removeUser).not.toHaveBeenCalled();
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('does not delete the current user', async () => {
      const { useCases, auth } = makeContext({
        permissionChecker: makePermissionChecker(userDeletePermission),
      });

      await expect(
        expectOk(useCases.delete({ currentUserId: userId, id: userId }))
      ).resolves.toEqual({ type: 'user_self' });

      expect(auth.removeUser).not.toHaveBeenCalled();
    });

    it('returns auth provider delete failures as app errors', async () => {
      const { useCases } = makeContext({
        permissionChecker: makePermissionChecker(userDeletePermission),
        auth: {
          removeUser: vi.fn<UserAuthGateway['removeUser']>(async () =>
            Result.Error(
              new AppError({
                code: 'USER_DELETE_FAILED',
                category: 'system',
                status: 500,
                message: 'Failed to delete user',
              })
            )
          ),
        },
      });

      await expect(
        expectFailure(useCases.delete({ currentUserId: adminId, id: userId }))
      ).resolves.toMatchObject({
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
        expectOk(
          useCases.listSessions({
            currentUserId: adminId,
            userId,
            cursor,
            limit: 10,
          })
        )
      ).resolves.toEqual({
        type: 'user_sessions_listed',
        page: {
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
        expectOk(
          useCases.listSessions({
            currentUserId: adminId,
            userId,
            limit: 10,
          })
        )
      ).resolves.toEqual({ type: 'user_forbidden' });

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
        expectOk(
          useCases.revokeSessions({ currentUserId: adminId, id: userId })
        )
      ).resolves.toEqual({ type: 'user_sessions_revoked' });

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
        expectOk(
          useCases.revokeSessions({ currentUserId: adminId, id: userId })
        )
      ).resolves.toEqual({ type: 'user_forbidden' });

      expect(auth.revokeUserSessions).not.toHaveBeenCalled();
    });

    it('does not revoke the current user sessions through the admin flow', async () => {
      const { useCases, auth } = makeContext({
        permissionChecker: makePermissionChecker(sessionRevokePermission),
      });

      await expect(
        expectOk(useCases.revokeSessions({ currentUserId: userId, id: userId }))
      ).resolves.toEqual({ type: 'user_self' });

      expect(auth.revokeUserSessions).not.toHaveBeenCalled();
    });

    it('returns auth provider revoke-all failures as app errors', async () => {
      const { useCases } = makeContext({
        permissionChecker: makePermissionChecker(sessionRevokePermission),
        auth: {
          revokeUserSessions: vi.fn<UserAuthGateway['revokeUserSessions']>(
            async () =>
              Result.Error(
                new AppError({
                  code: 'USER_SESSIONS_REVOKE_FAILED',
                  category: 'system',
                  status: 500,
                  message: 'Failed to revoke user sessions',
                })
              )
          ),
        },
      });

      await expect(
        expectFailure(
          useCases.revokeSessions({ currentUserId: adminId, id: userId })
        )
      ).resolves.toMatchObject({
        code: 'USER_SESSIONS_REVOKE_FAILED',
        message: 'Failed to revoke user sessions',
      });
    });
  });

  describe('revokeSession', () => {
    it('revokes one resolved session through the auth gateway', async () => {
      const { useCases, repo, auth, permissionChecker } = makeContext({
        permissionChecker: makePermissionChecker(sessionRevokePermission),
      });

      await expect(
        expectOk(
          useCases.revokeSession({
            currentUserId: adminId,
            currentSessionId,
            id: userId,
            sessionId: targetSessionId,
          })
        )
      ).resolves.toEqual({ type: 'user_session_revoked' });

      expect(permissionChecker.hasPermission).toHaveBeenCalledWith(
        adminId,
        sessionRevokePermission
      );
      expect(repo.findSessionForRevocation).toHaveBeenCalledWith({
        userId,
        sessionId: targetSessionId,
      });
      expect(auth.revokeUserSession).toHaveBeenCalledWith({
        userId,
        sessionId: targetSessionId,
      });
    });

    it('does not revoke one session without permission', async () => {
      const { useCases, repo, auth } = makeContext({
        permissionChecker: makePermissionChecker(),
      });

      await expect(
        expectOk(
          useCases.revokeSession({
            currentUserId: adminId,
            currentSessionId,
            id: userId,
            sessionId: targetSessionId,
          })
        )
      ).resolves.toEqual({ type: 'user_forbidden' });

      expect(repo.findSessionForRevocation).not.toHaveBeenCalled();
      expect(auth.revokeUserSession).not.toHaveBeenCalled();
    });

    it('returns not_found when the session cannot be resolved', async () => {
      const { useCases, auth } = makeContext({
        permissionChecker: makePermissionChecker(sessionRevokePermission),
        repo: {
          findSessionForRevocation: vi.fn<
            UserRepository['findSessionForRevocation']
          >(async () => Result.Ok({ type: 'user_session_not_found' })),
        },
      });

      await expect(
        expectOk(
          useCases.revokeSession({
            currentUserId: adminId,
            currentSessionId,
            id: userId,
            sessionId: targetSessionId,
          })
        )
      ).resolves.toEqual({ type: 'user_session_not_found' });

      expect(auth.revokeUserSession).not.toHaveBeenCalled();
    });

    it('does not revoke the current browser session', async () => {
      const { useCases, auth } = makeContext({
        permissionChecker: makePermissionChecker(sessionRevokePermission),
      });

      await expect(
        expectOk(
          useCases.revokeSession({
            currentUserId: adminId,
            currentSessionId: targetSessionId,
            id: userId,
            sessionId: targetSessionId,
          })
        )
      ).resolves.toEqual({ type: 'user_self' });

      expect(auth.revokeUserSession).not.toHaveBeenCalled();
    });

    it('returns auth provider revoke-one failures as app errors', async () => {
      const { useCases } = makeContext({
        permissionChecker: makePermissionChecker(sessionRevokePermission),
        auth: {
          revokeUserSession: vi.fn<UserAuthGateway['revokeUserSession']>(
            async () =>
              Result.Error(
                new AppError({
                  code: 'USER_SESSION_REVOKE_FAILED',
                  category: 'system',
                  status: 500,
                  message: 'Failed to revoke user session',
                })
              )
          ),
        },
      });

      await expect(
        expectFailure(
          useCases.revokeSession({
            currentUserId: adminId,
            currentSessionId,
            id: userId,
            sessionId: targetSessionId,
          })
        )
      ).resolves.toMatchObject({
        code: 'USER_SESSION_REVOKE_FAILED',
        message: 'Failed to revoke user session',
      });
    });
  });
});
