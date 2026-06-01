import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  AuthEmailPort,
  AuthorizationGateway,
  SessionGateway,
  UserAdminGateway,
} from '@/modules/auth';
import { toUserId } from '@/modules/kernel/domain/ids';

import {
  __resetAuthComposition,
  type AuthOverrides,
  getAuthHttpGateway,
  getAuthUseCases,
} from '@/composition/auth';

const makeAuthOverrides = (): Required<AuthOverrides> => ({
  sessionGateway: {
    getSession: vi.fn(async () => null),
  } as SessionGateway,
  authorizationGateway: {
    userHasPermission: vi.fn(async () => true),
  } as AuthorizationGateway,
  authEmailPort: {
    sendSignInOtp: vi.fn(async () => {}),
  } as AuthEmailPort,
  userAdminGateway: {
    removeUser: vi.fn(async () => true),
    revokeUserSessions: vi.fn(async () => true),
    revokeUserSession: vi.fn(async () => true),
  } as UserAdminGateway,
});

describe('auth composition', () => {
  beforeEach(() => {
    __resetAuthComposition();
  });

  it('returns a singleton when overrides are not provided', () => {
    const first = getAuthUseCases();
    const second = getAuthUseCases();

    expect(second).toBe(first);
  });

  it('returns fresh use cases when overrides are provided', async () => {
    const overrides = makeAuthOverrides();
    const first = getAuthUseCases(overrides);
    const second = getAuthUseCases(overrides);

    expect(second).not.toBe(first);

    await first.checkPermission({
      userId: toUserId('user-1'),
      permissions: { book: ['read'] },
      headers: new Headers(),
    });
    expect(
      overrides.authorizationGateway.userHasPermission
    ).toHaveBeenCalledOnce();
  });

  it('rebuilds the singleton after reset', () => {
    const first = getAuthUseCases();
    __resetAuthComposition();
    const second = getAuthUseCases();

    expect(second).not.toBe(first);
  });

  it('allows auth HTTP handling to be overridden without exposing provider handlers', async () => {
    const response = new Response('ok');
    const handle = vi.fn(async () => response);
    const gateway = getAuthHttpGateway({
      authHttpGateway: {
        handle,
      },
    });
    const request = new Request('http://localhost/api/auth/session');

    await expect(gateway.handle(request)).resolves.toBe(response);
    expect(handle).toHaveBeenCalledWith(request);
  });
});
