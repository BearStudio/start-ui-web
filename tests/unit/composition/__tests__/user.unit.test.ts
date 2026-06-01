import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  toEmailAddress,
  toSessionId,
  toUserId,
} from '@/modules/kernel/domain/ids';
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
  list: async () => ({ items: [user], total: 1 }),
  getById: async () => user,
  create: async () => user,
  getUpdateSnapshot: async () => ({
    email: user.email,
    role: user.role,
  }),
  update: async () => user,
  listSessions: async () => ({ items: [session], total: 1 }),
  findSessionForRevocation: async () => ({
    id: session.id,
  }),
  ...overrides,
});

const makeUserAuthGateway = (
  overrides: Partial<UserAuthGateway> = {}
): UserAuthGateway => ({
  removeUser: async () => true,
  revokeUserSessions: async () => true,
  revokeUserSession: async () => true,
  ...overrides,
});

const scope = (userId: string) =>
  ({ userId: toUserId(userId), role: 'user' }) as const;

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
    const list = vi.fn(async () => ({ items: [user], total: 1 }));
    const useCases = getUserUseCases({
      kernel: makeTestKernel(),
      userRepository: makeUserRepository({ list }),
      userAuthGateway: makeUserAuthGateway(),
    });

    await expect(
      useCases.list({
        scope: scope('admin-1'),
        limit: 20,
        searchTerm: 'user',
      })
    ).resolves.toMatchObject({ ok: true, value: { total: 1 } });
    expect(list).toHaveBeenCalledWith({
      cursor: undefined,
      limit: 20,
      searchTerm: 'user',
    });
  });
});
