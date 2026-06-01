import { describe, expect, it, vi } from 'vitest';

import type { Auth } from '@/modules/auth/infrastructure/better-auth/auth';
import { UserAdminGatewayBetterAuth } from '@/modules/auth/infrastructure/better-auth/user-admin-gateway-better-auth';
import { toSessionId, toUserId } from '@/modules/kernel/domain/ids';
import type { Database } from '@/modules/kernel/infrastructure/db/client';

const makeAuth = () => ({
  api: {
    revokeUserSession: vi.fn(async () => ({ success: true })),
  },
});

const makeDb = (session: { token: string } | null) =>
  ({
    query: {
      session: {
        findFirst: vi.fn(async () => session),
      },
    },
  }) as unknown as Database;

describe('UserAdminGatewayBetterAuth', () => {
  it('resolves the provider session token inside the adapter', async () => {
    const auth = makeAuth();
    const gateway = new UserAdminGatewayBetterAuth(
      auth as unknown as Auth,
      makeDb({ token: 'session-token' })
    );
    const headers = new Headers();

    await expect(
      gateway.revokeUserSession({
        userId: toUserId('user-1'),
        sessionId: toSessionId('session-1'),
        headers,
      })
    ).resolves.toBe(true);

    expect(auth.api.revokeUserSession).toHaveBeenCalledWith({
      body: { sessionToken: 'session-token' },
      headers,
    });
  });

  it('does not call Better Auth when the session does not belong to the user', async () => {
    const auth = makeAuth();
    const gateway = new UserAdminGatewayBetterAuth(
      auth as unknown as Auth,
      makeDb(null)
    );

    await expect(
      gateway.revokeUserSession({
        userId: toUserId('user-1'),
        sessionId: toSessionId('session-1'),
        headers: new Headers(),
      })
    ).resolves.toBe(false);

    expect(auth.api.revokeUserSession).not.toHaveBeenCalled();
  });
});
