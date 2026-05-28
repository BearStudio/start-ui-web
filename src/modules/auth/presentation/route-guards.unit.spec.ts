import { describe, expect, it, vi } from 'vitest';

import { type CurrentSession, scopeKeyFromScope } from '@/modules/auth';
import { toEmailAddress, toSessionId, toUserId } from '@/modules/kernel';

import { parseSafeRedirectPath } from './redirects';
import {
  ForbiddenRouteError,
  redirectAuthenticatedRoute,
  requireAuthenticatedRoute,
  requireOnboardingRoute,
} from './route-guards';

const location = {
  href: '/manager/books?searchTerm=du',
  pathname: '/manager/books',
  searchStr: '?searchTerm=du',
};

const makeSession = (
  overrides: Partial<CurrentSession['user']> = {}
): CurrentSession => {
  const role = (overrides.role ?? 'admin') as CurrentSession['scope']['role'];
  const scope: CurrentSession['scope'] = {
    userId: toUserId('user-1'),
    role,
  };

  return {
    user: {
      id: toUserId('user-1'),
      email: toEmailAddress('user@example.com'),
      name: 'User One',
      image: null,
      role: 'admin',
      onboardedAt: new Date('2024-01-01T00:00:00.000Z'),
      ...overrides,
    },
    session: {
      id: toSessionId('session-1'),
      expiresAt: new Date('2024-01-02T00:00:00.000Z'),
    },
    scope,
    scopeKey: scopeKeyFromScope(scope),
  };
};

const makeContext = (session: CurrentSession | null) => ({
  auth: {
    getSession: vi.fn(async () => session),
  },
});

const getThrown = async (fn: () => Promise<unknown>) => {
  try {
    await fn();
  } catch (error) {
    return error as ExplicitAny;
  }
  throw new Error('Expected function to throw');
};

describe('auth route guards', () => {
  it('redirects unauthenticated users to login with the current location', async () => {
    const error = await getThrown(() =>
      requireAuthenticatedRoute({
        context: makeContext(null),
        location,
        permissionApps: ['manager'],
      })
    );

    expect(error.options).toMatchObject({
      to: '/login',
      search: { redirect: '/manager/books?searchTerm=du' },
      replace: true,
    });
  });

  it('redirects not-onboarded users and preserves a safe destination', async () => {
    const error = await getThrown(() =>
      redirectAuthenticatedRoute({
        context: makeContext(makeSession({ onboardedAt: null })),
        redirect: '/manager/users?searchTerm=a#details',
      })
    );

    expect(error.options).toMatchObject({
      to: '/onboarding',
      search: { redirect: '/manager/users?searchTerm=a#details' },
      replace: true,
    });
  });

  it('redirects already-onboarded onboarding visits to the safe destination', async () => {
    const error = await getThrown(() =>
      requireOnboardingRoute({
        context: makeContext(makeSession()),
        location,
        redirect: '/app/books#current',
      })
    );

    expect(error.options).toMatchObject({
      to: '/app/books',
      search: {},
      hash: 'current',
      replace: true,
    });
  });

  it('redirects onboarded admins to the manager app after login', async () => {
    const error = await getThrown(() =>
      redirectAuthenticatedRoute({
        context: makeContext(makeSession({ role: 'admin' })),
      })
    );

    expect(error.options).toMatchObject({
      to: '/manager',
      replace: true,
    });
  });

  it('redirects onboarded users to the user app after login', async () => {
    const error = await getThrown(() =>
      redirectAuthenticatedRoute({
        context: makeContext(makeSession({ role: 'user' })),
      })
    );

    expect(error.options).toMatchObject({
      to: '/app',
      replace: true,
    });
  });

  it('uses the router auth session accessor for post-login redirects', async () => {
    const context = makeContext(makeSession({ role: 'admin' }));

    await getThrown(() =>
      redirectAuthenticatedRoute({
        context,
      })
    );

    expect(context.auth.getSession).toHaveBeenCalledTimes(1);
  });

  it('throws forbidden route errors for missing app permissions', async () => {
    await expect(
      requireAuthenticatedRoute({
        context: makeContext(makeSession({ role: 'user' })),
        location,
        permissionApps: ['manager'],
      })
    ).rejects.toBeInstanceOf(ForbiddenRouteError);
  });

  it('rejects unsafe redirect targets', () => {
    expect(parseSafeRedirectPath('https://example.com')).toBeNull();
    expect(parseSafeRedirectPath('//example.com/app')).toBeNull();
    expect(parseSafeRedirectPath('/login?redirect=/app')).toBeNull();
    expect(parseSafeRedirectPath('/logout')).toBeNull();
    expect(parseSafeRedirectPath('/manager?tab=users#details')).toEqual({
      to: '/manager',
      search: { tab: 'users' },
      hash: 'details',
    });
  });
});
