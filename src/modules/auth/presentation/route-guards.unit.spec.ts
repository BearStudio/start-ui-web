import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import type { CurrentSession } from '@/modules/auth';
import { authQueries } from '@/modules/auth/client';

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
): CurrentSession => ({
  user: {
    id: 'user-1',
    email: 'user@example.com',
    name: 'User One',
    image: null,
    role: 'admin',
    onboardedAt: new Date('2024-01-01T00:00:00.000Z'),
    ...overrides,
  },
  session: {
    id: 'session-1',
    expiresAt: new Date('2024-01-02T00:00:00.000Z'),
  },
  scope: {
    userId: 'user-1',
    role: (overrides.role ?? 'admin') as CurrentSession['scope']['role'],
    tenantId: null,
  },
  scopeKey: `user:user-1:role:${overrides.role ?? 'admin'}:tenant:none`,
});

const makeContext = (session: CurrentSession | null) => {
  const queryClient = new QueryClient();
  queryClient.setQueryData(authQueries.currentSession().queryKey, session);
  return { queryClient };
};

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
        redirect: '/manager/users?searchTerm=a',
      })
    );

    expect(error.options).toMatchObject({
      to: '/onboarding',
      search: { redirect: '/manager/users?searchTerm=a' },
      replace: true,
    });
  });

  it('redirects already-onboarded onboarding visits to the safe destination', async () => {
    const error = await getThrown(() =>
      requireOnboardingRoute({
        context: makeContext(makeSession()),
        location,
        redirect: '/app/books',
      })
    );

    expect(error.options).toMatchObject({
      to: '/app/books',
      search: {},
      replace: true,
    });
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
    expect(parseSafeRedirectPath('/manager?tab=users')).toEqual({
      to: '/manager',
      search: { tab: 'users' },
    });
  });
});
