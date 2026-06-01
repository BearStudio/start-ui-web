import { expect, vi } from 'vitest';

import type { Permission } from '@/modules/auth';
import { toEmailAddress, toSessionId, toUserId } from '@/modules/kernel';

const hoisted = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockUserHasPermission: vi.fn(),
}));

export const mockGetSession = hoisted.mockGetSession;
export const mockUserHasPermission = hoisted.mockUserHasPermission;

import type { Mock } from 'vitest';

type DrizzleQueryMock = {
  findFirst: Mock;
  findMany: Mock;
};

type MockedDb = {
  query: {
    user: DrizzleQueryMock;
    session: DrizzleQueryMock;
    book: DrizzleQueryMock;
    genre: DrizzleQueryMock;
    account: DrizzleQueryMock;
    authIdentity: DrizzleQueryMock;
    verification: DrizzleQueryMock;
    emailStatus: DrizzleQueryMock;
  };
  select: Mock;
  insert: Mock;
  update: Mock;
  delete: Mock;
};

function makeQueryMock(): DrizzleQueryMock {
  return {
    findFirst: vi.fn(),
    findMany: vi.fn(),
  };
}

/**
 * Build a chain stub where every accessed method on the result is callable and
 * returns the same chain. The chain itself is awaitable, resolving to `result`.
 * If `result` is an Error, the await throws.
 */
export function chainResult<T>(result: T | Error) {
  const buildChain = (): ExplicitAny => {
    const target: ExplicitAny = {};
    return new Proxy(target, {
      get(t, prop: string | symbol) {
        if (prop === 'then') {
          return (
            onFulfilled?: (v: T) => unknown,
            onRejected?: (e: unknown) => unknown
          ) => {
            if (result instanceof Error) {
              return Promise.reject(result).then(onFulfilled, onRejected);
            }
            return Promise.resolve(result as T).then(onFulfilled, onRejected);
          };
        }
        if (prop === Symbol.toStringTag) return 'Promise';
        if (prop in t) return t[prop as string];
        const fn = vi.fn(() => buildChain());
        t[prop as string] = fn;
        return fn;
      },
    });
  };
  return buildChain();
}

function buildMockDb(): MockedDb {
  return {
    query: {
      user: makeQueryMock(),
      session: makeQueryMock(),
      book: makeQueryMock(),
      genre: makeQueryMock(),
      account: makeQueryMock(),
      authIdentity: makeQueryMock(),
      verification: makeQueryMock(),
      emailStatus: makeQueryMock(),
    },
    select: vi.fn(() => chainResult([])),
    insert: vi.fn(() => chainResult([])),
    update: vi.fn(() => chainResult([])),
    delete: vi.fn(() => chainResult([])),
  };
}

export const mockDb: MockedDb = buildMockDb();

export function resetMockDb() {
  const fresh = buildMockDb();
  mockDb.query = fresh.query;
  mockDb.select = fresh.select;
  mockDb.insert = fresh.insert;
  mockDb.update = fresh.update;
  mockDb.delete = fresh.delete;
}

export const mockUser = {
  id: toUserId('user-1'),
  name: 'Test User',
  email: toEmailAddress('user@example.com'),
  emailVerified: true,
  image: null,
  role: 'user' as const,
  onboardedAt: new Date('2024-01-01T00:00:00.000Z'),
};
export const mockSession = {
  id: toSessionId('session-1'),
  token: 'session-token-1',
  expiresAt: new Date('2099-01-02T00:00:00.000Z'),
};

export const expectedPermissionRequest = (permissions: Permission) => ({
  body: {
    userId: mockUser.id,
    permissions,
  },
  headers: expect.any(Headers),
});

export function setupAuthenticatedUser() {
  mockGetSession.mockResolvedValue({
    user: mockUser,
    session: mockSession,
  });
  mockUserHasPermission.mockResolvedValue({ success: true, error: false });
}

export const mockLogger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

export const createAuthenticatedContext = (overrides?: {
  user?: typeof mockUser;
  session?: typeof mockSession;
}) =>
  ({
    user: overrides?.user ?? mockUser,
    session: overrides?.session ?? mockSession,
    scope: {
      userId: (overrides?.user ?? mockUser).id,
      role: (overrides?.user ?? mockUser).role,
    },
    logger: mockLogger,
  }) as ExplicitAny;
