import { describe, expect, it, vi } from 'vitest';

import type { Auth } from '@/modules/auth/infrastructure/better-auth/auth';

vi.mock('./auth', () => ({
  getDefaultAuth: vi.fn(),
}));

const loadGateway = async () =>
  import('@/modules/auth/infrastructure/better-auth/session-gateway-better-auth');

const makeAuth = (role: unknown): Auth =>
  ({
    api: {
      getSession: vi.fn(async () => ({
        user: {
          id: 'user-1',
          email: 'user@example.com',
          name: 'Test User',
          image: null,
          emailVerified: true,
          role,
          onboardedAt: null,
        },
        session: {
          id: 'session-1',
          userId: 'user-1',
          expiresAt: new Date('2026-12-31'),
        },
      })),
    },
  }) as unknown as Auth;

describe('SessionGatewayBetterAuth', () => {
  it('keeps valid provider roles', async () => {
    const { SessionGatewayBetterAuth } = await loadGateway();
    const gateway = new SessionGatewayBetterAuth(makeAuth('admin'));

    const session = await gateway.getSession({ headers: new Headers() });

    expect(session?.user.role).toBe('admin');
  });

  it('falls back to the least-privileged role for unknown provider roles', async () => {
    const { SessionGatewayBetterAuth } = await loadGateway();
    const gateway = new SessionGatewayBetterAuth(makeAuth('owner'));

    const session = await gateway.getSession({ headers: new Headers() });

    expect(session?.user.role).toBe('user');
  });
});
