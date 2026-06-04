import { Result } from '@swan-io/boxed';
import { describe, expect, it, vi } from 'vitest';

import {
  type AuthEmailPort,
  type AuthorizationGateway,
  type AuthSession,
  createAuthUseCases,
  type SessionGateway,
  type UserAdminGateway,
} from '@/modules/auth/testing';
import {
  toEmailAddress,
  toLanguageCode,
  toOtpCode,
  toSessionId,
  toUserId,
} from '@/modules/kernel';
import type { ApplicationResult } from '@/modules/kernel/testing';

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
    getSession: vi.fn(async () =>
      Result.Ok({ type: 'auth_session_found', session })
    ),
    ...overrides?.sessionGateway,
  } as SessionGateway,
  authorizationGateway: {
    userHasPermission: vi.fn(async () =>
      Result.Ok({ type: 'auth_permission_granted' })
    ),
    ...overrides?.authorizationGateway,
  } as AuthorizationGateway,
  authEmailPort: {
    sendSignInOtp: vi.fn(async () =>
      Result.Ok({ type: 'auth_sign_in_otp_sent' })
    ),
    ...overrides?.authEmailPort,
  } as AuthEmailPort,
  userAdminGateway: {
    removeUser: vi.fn(async () => Result.Ok({ type: 'auth_user_removed' })),
    revokeUserSessions: vi.fn(async () =>
      Result.Ok({ type: 'auth_user_sessions_revoked' })
    ),
    revokeUserSession: vi.fn(async () =>
      Result.Ok({ type: 'auth_user_session_revoked' })
    ),
    ...overrides?.userAdminGateway,
  } as UserAdminGateway,
});

function getOk<TOutcome extends { type: string }>(
  result: ApplicationResult<TOutcome>
) {
  if (result.isError()) throw result.getError();
  return result.get();
}

describe('auth use cases', () => {
  it('returns session from the gateway', async () => {
    const deps = makeDeps();
    const useCases = createAuthUseCases(deps);
    const headers = new Headers();

    const result = await useCases.getCurrentSession({ headers });

    expect(getOk(result)).toEqual({ type: 'auth_session_found', session });
    expect(deps.sessionGateway.getSession).toHaveBeenCalledWith({ headers });
  });

  it('returns null when there is no session', async () => {
    const deps = makeDeps({
      sessionGateway: {
        getSession: vi.fn(async () =>
          Result.Ok({ type: 'auth_session_missing' as const })
        ),
      },
    });
    const useCases = createAuthUseCases(deps);

    const result = await useCases.getCurrentSession({ headers: new Headers() });
    expect(getOk(result)).toEqual({ type: 'auth_session_missing' });
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

    expect(getOk(allowed)).toEqual({ type: 'auth_permission_granted' });
    expect(deps.authorizationGateway.userHasPermission).toHaveBeenCalledWith({
      userId: toUserId('user-1'),
      permissions: { book: ['create'] },
      headers,
    });
  });

  it('delegates sendSignInOtp to the email port', async () => {
    const deps = makeDeps();
    const useCases = createAuthUseCases(deps);

    const result = await useCases.sendSignInOtp({
      email: toEmailAddress('a@b.com'),
      otp: toOtpCode('123456'),
      language: toLanguageCode('en'),
    });

    expect(getOk(result)).toEqual({ type: 'auth_sign_in_otp_sent' });
    expect(deps.authEmailPort.sendSignInOtp).toHaveBeenCalledWith({
      email: toEmailAddress('a@b.com'),
      otp: toOtpCode('123456'),
      language: toLanguageCode('en'),
    });
  });

  it('delegates user-admin operations to the gateway', async () => {
    const deps = makeDeps();
    const useCases = createAuthUseCases(deps);
    const headers = new Headers();

    const removed = await useCases.removeUser({
      userId: toUserId('user-1'),
      headers,
    });
    const revokedSessions = await useCases.revokeUserSessions({
      userId: toUserId('user-1'),
      headers,
    });
    const revokedSession = await useCases.revokeUserSession({
      userId: toUserId('user-1'),
      sessionId: toSessionId('session-1'),
      headers,
    });

    expect(getOk(removed)).toEqual({ type: 'auth_user_removed' });
    expect(getOk(revokedSessions)).toEqual({
      type: 'auth_user_sessions_revoked',
    });
    expect(getOk(revokedSession)).toEqual({
      type: 'auth_user_session_revoked',
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
      userId: toUserId('user-1'),
      sessionId: toSessionId('session-1'),
      headers,
    });
  });
});
