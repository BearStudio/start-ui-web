import { describe, expect, it, vi } from 'vitest';

import type { AuthEmailPort } from '../ports/auth-email-port';
import type { AuthorizationGateway } from '../ports/authorization-gateway';
import type { SessionGateway } from '../ports/session-gateway';
import type { UserAdminGateway } from '../ports/user-admin-gateway';
import type { AuthSession } from '../../domain/session';
import { createAuthUseCases } from '../../factory';

const session: AuthSession = {
  user: {
    id: 'user-1',
    email: 'user@example.com',
    name: 'Test',
    emailVerified: true,
    image: null,
    role: 'user',
    onboardedAt: new Date('2026-01-01'),
  },
  session: {
    id: 'session-1',
    userId: 'user-1',
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
      userId: 'user-1',
      permissions: { book: ['create'] },
      headers,
    });

    expect(allowed).toBe(true);
    expect(deps.authorizationGateway.userHasPermission).toHaveBeenCalledWith({
      userId: 'user-1',
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

    await useCases.removeUser({ userId: 'user-1', headers });
    await useCases.revokeUserSessions({ userId: 'user-1', headers });
    await useCases.revokeUserSession({
      sessionId: 'session-1',
      providerSessionToken: 'provider-token',
      headers,
    });

    expect(deps.userAdminGateway.removeUser).toHaveBeenCalledWith({
      userId: 'user-1',
      headers,
    });
    expect(deps.userAdminGateway.revokeUserSessions).toHaveBeenCalledWith({
      userId: 'user-1',
      headers,
    });
    expect(deps.userAdminGateway.revokeUserSession).toHaveBeenCalledWith({
      sessionId: 'session-1',
      providerSessionToken: 'provider-token',
      headers,
    });
  });
});
