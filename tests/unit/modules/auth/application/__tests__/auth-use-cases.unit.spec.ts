import { describe, expect, it, vi } from 'vitest';

import { toEmailAddress, toSessionId, toUserId } from '@/modules/kernel';

import type { AuthEmailPort } from '@/modules/auth/application/ports/auth-email-port';
import type { AuthorizationGateway } from '@/modules/auth/application/ports/authorization-gateway';
import type { SessionGateway } from '@/modules/auth/application/ports/session-gateway';
import type { UserAdminGateway } from '@/modules/auth/application/ports/user-admin-gateway';
import type { AuthSession } from '@/modules/auth/domain/session';
import { createAuthUseCases } from '@/modules/auth/factory';

const session: AuthSession = {
  user: {
    id: toUserId('user-1'),
    email: toEmailAddress('user@example.com'),
    name: 'Test',
    emailVerified: true,
    image: null,
    role: 'user',
    onboardedAt: new Date('2026-01-01'),
  },
  session: {
    id: toSessionId('session-1'),
    userId: toUserId('user-1'),
    expiresAt: new Date('2026-12-31'),
  },
};

const makeDeps = (overrides?: {
  sessionGateway?: Partial<SessionGateway>;
  authorizationGateway?: Partial<AuthorizationGateway>;
  authEmailPort?: Partial<AuthEmailPort>;
  userAdminGateway?: Partial<UserAdminGateway>;
}) => ({
  sessionGateway: {
    getSession: vi.fn(async () => session),
    ...overrides?.sessionGateway,
  } as SessionGateway,
  authorizationGateway: {
    userHasPermission: vi.fn(async () => true),
    ...overrides?.authorizationGateway,
  } as AuthorizationGateway,
  authEmailPort: {
    sendSignInOtp: vi.fn(async () => {}),
    ...overrides?.authEmailPort,
  } as AuthEmailPort,
  userAdminGateway: {
    removeUser: vi.fn(async () => true),
    revokeUserSessions: vi.fn(async () => true),
    revokeUserSession: vi.fn(async () => true),
    ...overrides?.userAdminGateway,
  } as UserAdminGateway,
});

describe('auth use cases', () => {
  it('returns session from the gateway', async () => {
    const deps = makeDeps();
    const useCases = createAuthUseCases(deps);
    const headers = new Headers();

    const result = await useCases.getCurrentSession({ headers });

    expect(result).toEqual(session);
    expect(deps.sessionGateway.getSession).toHaveBeenCalledWith({ headers });
  });

  it('returns null when there is no session', async () => {
    const deps = makeDeps({
      sessionGateway: { getSession: vi.fn(async () => null) },
    });
    const useCases = createAuthUseCases(deps);

    await expect(
      useCases.getCurrentSession({ headers: new Headers() })
    ).resolves.toBeNull();
  });

  it('delegates checkPermission to the authorization gateway', async () => {
    const deps = makeDeps();
    const useCases = createAuthUseCases(deps);
    const headers = new Headers();

    const allowed = await useCases.checkPermission({
      userId: toUserId('user-1'),
      permissions: { book: ['create'] },
      headers,
    });

    expect(allowed).toBe(true);
    expect(deps.authorizationGateway.userHasPermission).toHaveBeenCalledWith({
      userId: toUserId('user-1'),
      permissions: { book: ['create'] },
      headers,
    });
  });

  it('delegates sendSignInOtp to the email port', async () => {
    const deps = makeDeps();
    const useCases = createAuthUseCases(deps);

    await useCases.sendSignInOtp({
      email: 'a@b.com',
      otp: '123456',
      language: 'en',
    });

    expect(deps.authEmailPort.sendSignInOtp).toHaveBeenCalledWith({
      email: 'a@b.com',
      otp: '123456',
      language: 'en',
    });
  });

  it('delegates user-admin operations to the gateway', async () => {
    const deps = makeDeps();
    const useCases = createAuthUseCases(deps);
    const headers = new Headers();

    await useCases.removeUser({ userId: toUserId('user-1'), headers });
    await useCases.revokeUserSessions({ userId: toUserId('user-1'), headers });
    await useCases.revokeUserSession({
      sessionId: toSessionId('session-1'),
      providerToken: 'provider-token',
      headers,
    });

    expect(deps.userAdminGateway.removeUser).toHaveBeenCalledWith({
      userId: toUserId('user-1'),
      headers,
    });
    expect(deps.userAdminGateway.revokeUserSessions).toHaveBeenCalledWith({
      userId: toUserId('user-1'),
      headers,
    });
    expect(deps.userAdminGateway.revokeUserSession).toHaveBeenCalledWith({
      sessionId: toSessionId('session-1'),
      providerToken: 'provider-token',
      headers,
    });
  });
});
