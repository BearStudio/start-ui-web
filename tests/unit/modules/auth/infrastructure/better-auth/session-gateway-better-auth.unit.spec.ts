import { describe, expect, it, vi } from 'vitest';

import type { Auth } from '@/modules/auth/infrastructure/better-auth/auth';
import type { Database } from '@/modules/kernel/infrastructure/db/client';

vi.mock('@/modules/auth/infrastructure/better-auth/auth', () => ({
  getDefaultAuth: vi.fn(),
}));

const loadGateway = async () =>
  import('@/modules/auth/infrastructure/better-auth/session-gateway-better-auth');

const makeAuth = (
  role: unknown,
  overrides: {
    userId?: string;
    email?: string;
  } = {}
): Auth =>
  ({
    api: {
      getSession: vi.fn(async () => ({
        user: {
          id: overrides.userId ?? 'user-1',
          email: overrides.email ?? 'user@example.com',
          name: 'Test User',
          image: null,
          emailVerified: true,
          role,
          onboardedAt: null,
        },
        session: {
          id: 'session-1',
          userId: overrides.userId ?? 'user-1',
          expiresAt: new Date('2026-12-31'),
        },
      })),
    },
  }) as unknown as Auth;

const makeDb = (
  input: {
    identityUserId?: string;
    appUser?: {
      id: string;
      email: string;
      name: string;
      image: string | null;
      emailVerified: boolean;
      role: string;
      onboardedAt: Date | null;
    } | null;
  } = {}
) => {
  const onConflictDoNothing = vi.fn(async () => undefined);
  const values = vi.fn(() => ({ onConflictDoNothing }));
  const insert = vi.fn(() => ({ values }));

  return {
    query: {
      authIdentity: {
        findFirst: vi.fn(async () =>
          input.identityUserId ? { userId: input.identityUserId } : null
        ),
      },
      user: {
        findFirst: vi.fn(async () => input.appUser ?? null),
      },
    },
    insert,
    __insertValues: values,
    __onConflictDoNothing: onConflictDoNothing,
  } as unknown as Database & {
    __insertValues: typeof values;
    __onConflictDoNothing: typeof onConflictDoNothing;
  };
};

describe('SessionGatewayBetterAuth', () => {
  it('keeps valid provider roles', async () => {
    const { SessionGatewayBetterAuth } = await loadGateway();
    const db = makeDb();
    const gateway = new SessionGatewayBetterAuth(makeAuth('admin'), db);

    const session = await gateway.getSession({ headers: new Headers() });

    expect(session?.user.role).toBe('admin');
    expect(db.__insertValues).toHaveBeenCalledWith({
      provider: 'better-auth',
      providerUserId: 'user-1',
      userId: 'user-1',
    });
  });

  it('falls back to the least-privileged role for unknown provider roles', async () => {
    const { SessionGatewayBetterAuth } = await loadGateway();
    const gateway = new SessionGatewayBetterAuth(makeAuth('owner'), makeDb());

    const session = await gateway.getSession({ headers: new Headers() });

    expect(session?.user.role).toBe('user');
  });

  it('maps provider users to local app users through auth identity', async () => {
    const { SessionGatewayBetterAuth } = await loadGateway();
    const gateway = new SessionGatewayBetterAuth(
      makeAuth('user', {
        userId: 'provider-user-1',
        email: 'provider@example.com',
      }),
      makeDb({
        identityUserId: 'app-user-1',
        appUser: {
          id: 'app-user-1',
          email: 'app@example.com',
          name: 'App User',
          image: null,
          emailVerified: true,
          role: 'admin',
          onboardedAt: new Date('2026-01-01T00:00:00.000Z'),
        },
      })
    );

    const session = await gateway.getSession({ headers: new Headers() });

    expect(session).toMatchObject({
      user: {
        id: 'app-user-1',
        email: 'app@example.com',
        role: 'admin',
      },
      session: {
        id: 'session-1',
        userId: 'app-user-1',
      },
    });
  });
});
