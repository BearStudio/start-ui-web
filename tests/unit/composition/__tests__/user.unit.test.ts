import { Result } from '@swan-io/boxed';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  toEmailAddress,
  toSessionId,
  toUserId,
} from '@/modules/kernel/domain/ids';
import type { ApplicationResult } from '@/modules/kernel/testing';
import type { UserAuthGateway, UserRepository } from '@/modules/user';

import { makeTestKernel, now } from '@tests/unit/composition/helpers';
import { __resetUserComposition, getUserUseCases } from '@/composition/user';

const user = {
  id: toUserId('user-1'),
  name: 'User One',
  email: toEmailAddress('user@example.com'),
  emailVerified: true,
  role: 'user' as const,
  image: null,
  createdAt: now,
  updatedAt: now,
  onboardedAt: now,
};

const session = {
  id: toSessionId('session-1'),
  createdAt: now,
  updatedAt: now,
  expiresAt: now,
  ipAddress: null,
  userAgent: null,
};

const makeUserRepository = (
  overrides: Partial<UserRepository> = {}
): UserRepository => ({
  list: async () =>
    Result.Ok({ type: 'user_listed', page: { items: [user], total: 1 } }),
  getById: async () => Result.Ok({ type: 'user_found', user }),
  create: async () => Result.Ok({ type: 'user_created', user }),
  getUpdateSnapshot: async () =>
    Result.Ok({
      type: 'user_update_snapshot_found',
      snapshot: {
        email: user.email,
        role: user.role,
      },
    }),
  update: async () => Result.Ok({ type: 'user_updated', user }),
  listSessions: async () =>
    Result.Ok({
      type: 'user_sessions_listed',
      page: { items: [session], total: 1 },
    }),
  findSessionForRevocation: async () =>
    Result.Ok({
      type: 'user_session_revocation_target_found',
      target: { id: session.id },
    }),
  ...overrides,
});

const makeUserAuthGateway = (
  overrides: Partial<UserAuthGateway> = {}
): UserAuthGateway => ({
  removeUser: async () => Result.Ok({ type: 'user_auth_removed' }),
  revokeUserSessions: async () =>
    Result.Ok({ type: 'user_auth_sessions_revoked' }),
  revokeUserSession: async () =>
    Result.Ok({ type: 'user_auth_session_revoked' }),
  ...overrides,
});

const scope = (userId: string) =>
  ({ userId: toUserId(userId), role: 'user' }) as const;

function getOk<TOutcome extends { type: string }>(
  result: ApplicationResult<TOutcome>
) {
  if (result.isError()) throw result.getError();
  return result.get();
}

describe('user composition', () => {
  beforeEach(() => {
    __resetUserComposition();
  });

  it('returns a singleton with use case methods when no overrides are provided', () => {
    const first = getUserUseCases();
    const second = getUserUseCases();

    expect(first).toBe(second);
    expect(typeof first.list).toBe('function');
  });

  it('returns a fresh object when overrides are provided', () => {
    const singleton = getUserUseCases();
    const overridden = getUserUseCases({
      kernel: makeTestKernel(),
      userRepository: makeUserRepository(),
      userAuthGateway: makeUserAuthGateway(),
    });

    expect(overridden).not.toBe(singleton);
  });

  it('routes use case calls through the overridden repository', async () => {
    const list = vi.fn(async () =>
      Result.Ok({
        type: 'user_listed' as const,
        page: { items: [user], total: 1 },
      })
    );
    const useCases = getUserUseCases({
      kernel: makeTestKernel(),
      userRepository: makeUserRepository({ list }),
      userAuthGateway: makeUserAuthGateway(),
    });

    const result = await useCases.list({
      currentUserId: scope('admin-1').userId,
      limit: 20,
      searchTerm: 'user',
    });

    expect(getOk(result)).toMatchObject({
      type: 'user_listed',
      page: { total: 1 },
    });
    expect(list).toHaveBeenCalledWith({
      cursor: undefined,
      limit: 20,
      searchTerm: 'user',
    });
  });
});
