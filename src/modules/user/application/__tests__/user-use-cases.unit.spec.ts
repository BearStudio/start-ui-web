import { describe, expect, it, vi } from 'vitest';

import type { PermissionChecker } from '@/modules/kernel/application/ports/permission-checker';
import { AppError } from '@/modules/kernel/domain/errors/app-error';
import {
  toEmailAddress,
  toSessionId,
  toUserId,
} from '@/modules/kernel/domain/ids';

import type { UserAuthGateway } from '../ports/user-auth-gateway';
import type { UserRepository } from '../ports/user-repository';
import type { User } from '../../domain/user';
import { createUserUseCases } from '../../factory';

const now = new Date('2026-01-01T00:00:00.000Z');
const user: User = {
  id: toUserId('user-1'),
  name: 'User',
  email: toEmailAddress('user@example.com'),
  emailVerified: true,
  role: 'user',
  image: null,
  createdAt: now,
  updatedAt: now,
  onboardedAt: null,
};

const logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
};

const allowed: PermissionChecker = {
  hasPermission: async () => true,
};

const authGateway: UserAuthGateway = {
  removeUser: async () => true,
  revokeUserSessions: async () => true,
  revokeUserSession: async () => true,
};

const scope = (userId: string) =>
  ({ userId, role: 'user', tenantId: null }) as const;

function makeRepo(overrides: Partial<UserRepository> = {}): UserRepository {
  return {
    list: async () => ({ items: [user], total: 1 }),
    getById: async () => user,
    create: async () => user,
    getUpdateSnapshot: async () => ({
      email: toEmailAddress('old@example.com'),
      role: 'user',
    }),
    update: async (_id, input) => ({
      ...user,
      name: input.name ?? user.name,
      email: input.email,
      role: input.role ?? user.role,
      emailVerified: input.emailVerified ?? user.emailVerified,
    }),
    listSessions: async () => ({
      items: [
        {
          id: toSessionId('session-2'),
          createdAt: now,
          updatedAt: now,
          expiresAt: now,
          ipAddress: null,
          userAgent: null,
        },
      ],
      total: 1,
    }),
    findSessionForRevocation: async () => ({
      id: toSessionId('session-2'),
      providerToken: 'session-token',
    }),
    ...overrides,
  };
}

function makeUseCases(
  overrides: {
    repo?: Partial<UserRepository>;
    permissionChecker?: PermissionChecker;
    auth?: Partial<UserAuthGateway>;
  } = {}
) {
  return createUserUseCases({
    userRepository: makeRepo(overrides.repo),
    userAuthGateway: { ...authGateway, ...overrides.auth },
    permissionChecker: overrides.permissionChecker ?? allowed,
    logger,
  });
}

describe('user use cases', () => {
  it('lists and gets users with forbidden and not_found branches', async () => {
    await expect(
      makeUseCases().list({
        scope: scope('admin-1'),
        limit: 20,
        searchTerm: '',
      })
    ).resolves.toMatchObject({ ok: true, value: { total: 1 } });
    await expect(
      makeUseCases({
        permissionChecker: { hasPermission: async () => false },
      }).list({ scope: scope('admin-1'), limit: 20, searchTerm: '' })
    ).resolves.toEqual({ ok: false, reason: 'forbidden' });
    await expect(
      makeUseCases({ repo: { getById: async () => null } }).get({
        scope: scope('admin-1'),
        id: toUserId('missing'),
      })
    ).resolves.toEqual({ ok: false, reason: 'not_found' });
  });

  it('creates users and maps duplicate email conflicts', async () => {
    await expect(
      makeUseCases({
        repo: {
          create: async () => {
            throw new AppError({
              code: 'USER_DUPLICATE',
              category: 'conflict',
              status: 409,
            });
          },
        },
      }).create({
        scope: scope('admin-1'),
        user: { email: toEmailAddress('user@example.com'), role: 'user' },
      })
    ).resolves.toEqual({ ok: false, reason: 'duplicate' });
    await expect(
      makeUseCases({
        repo: {
          create: async () => {
            throw new AppError({
              code: 'OTHER_CONFLICT',
              category: 'conflict',
              status: 409,
            });
          },
        },
      }).create({
        scope: scope('admin-1'),
        user: { email: toEmailAddress('user@example.com'), role: 'user' },
      })
    ).rejects.toMatchObject({ code: 'OTHER_CONFLICT' });
  });

  it('updates users without self role escalation and handles missing rows', async () => {
    const result = await makeUseCases().update({
      scope: scope('user-1'),
      id: toUserId('user-1'),
      user: { email: toEmailAddress('next@example.com'), role: 'admin' },
    });
    expect(result).toMatchObject({ ok: true });
    if (result.ok) {
      expect(result.value.role).toBe('user');
    }

    const updateSpy = vi.fn(makeRepo().update);
    await makeUseCases({ repo: { update: updateSpy } }).update({
      scope: scope('admin-1'),
      id: toUserId('user-1'),
      user: { email: toEmailAddress('next@example.com') },
    });
    expect(updateSpy).toHaveBeenCalledWith(
      toUserId('user-1'),
      expect.not.objectContaining({ name: expect.anything() })
    );

    await expect(
      makeUseCases({ repo: { getUpdateSnapshot: async () => null } }).update({
        scope: scope('admin-1'),
        id: toUserId('missing'),
        user: { email: toEmailAddress('next@example.com') },
      })
    ).resolves.toEqual({ ok: false, reason: 'not_found' });
  });

  it('protects destructive self operations and missing sessions', async () => {
    await expect(
      makeUseCases().delete({
        scope: scope('user-1'),
        id: toUserId('user-1'),
      })
    ).resolves.toEqual({ ok: false, reason: 'self' });
    await expect(
      makeUseCases().revokeSessions({
        scope: scope('user-1'),
        id: toUserId('user-1'),
      })
    ).resolves.toEqual({ ok: false, reason: 'self' });
    await expect(
      makeUseCases({
        repo: { findSessionForRevocation: async () => null },
      }).revokeSession({
        scope: scope('admin-1'),
        currentSessionId: toSessionId('current'),
        id: toUserId('user-1'),
        sessionId: toSessionId('missing'),
      })
    ).resolves.toEqual({ ok: false, reason: 'not_found' });
  });

  it('passes the resolved provider token when revoking a single session', async () => {
    const revokeUserSession = vi.fn(async () => true);

    await expect(
      makeUseCases({ auth: { revokeUserSession } }).revokeSession({
        scope: scope('admin-1'),
        currentSessionId: toSessionId('current'),
        id: toUserId('user-1'),
        sessionId: toSessionId('session-2'),
      })
    ).resolves.toMatchObject({ ok: true });

    expect(revokeUserSession).toHaveBeenCalledWith({
      id: toSessionId('session-2'),
      providerToken: 'session-token',
    });
  });

  it('lists sessions without token exposure', async () => {
    const result = await makeUseCases().listSessions({
      scope: scope('admin-1'),
      userId: toUserId('user-1'),
      limit: 20,
    });

    expect(result).toMatchObject({ ok: true });
    if (result.ok) {
      expect(result.value.items[0]).not.toHaveProperty('token');
    }
  });
});
