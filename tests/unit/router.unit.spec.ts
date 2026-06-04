import { getGlobalStartContext } from '@tanstack/react-start';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { authQueries } from '@/modules/auth/client';
import { toScopeKey } from '@/modules/kernel/testing';

const getGlobalStartContextMock = vi.mocked(getGlobalStartContext);

describe('router composition', () => {
  beforeEach(() => {
    getGlobalStartContextMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('passes the request CSP nonce to TanStack Router SSR options', async () => {
    getGlobalStartContextMock.mockReturnValue({
      cspNonce: 'router-nonce',
    } as never);

    const { getRouter } = await import('@/router');
    const router = getRouter() as ExplicitAny;

    expect(router.options.ssr?.nonce).toBe('router-nonce');
  }, 30_000);

  it('creates a router when Start context is not available', async () => {
    getGlobalStartContextMock.mockImplementation(() => {
      throw new Error('Start context is not ready');
    });

    const { getRouter } = await import('@/router');

    expect(() => getRouter()).not.toThrow();
  });

  it('uses cached session snapshots unless a fresh session is required', async () => {
    getGlobalStartContextMock.mockReturnValue({
      cspNonce: 'router-nonce',
    } as never);

    const { getRouter } = await import('@/router');
    const router = getRouter() as ExplicitAny;
    const context = router.options.context;
    const session = {
      scope: { role: 'admin', userId: 'user-1' },
      scopeKey: toScopeKey('user:user-1:role:admin'),
      session: { id: 'session-1' },
      user: {
        email: 'admin@example.com',
        id: 'user-1',
        onboardedAt: '2024-01-01T00:00:00.000Z',
        role: 'admin',
      },
    };

    context.queryClient.setQueryData(
      authQueries.currentSession().queryKey,
      session
    );
    const fetchQuery = vi
      .spyOn(context.queryClient, 'fetchQuery')
      .mockResolvedValue(session);

    vi.stubEnv('SSR', false);
    await expect(context.auth.getSession()).resolves.toEqual(session);
    expect(fetchQuery).not.toHaveBeenCalled();
    expect(context.auth.getSessionSnapshot()).toEqual(session);

    vi.stubEnv('SSR', true);
    await expect(context.auth.getSession()).resolves.toEqual(session);
    expect(fetchQuery).toHaveBeenCalledOnce();

    await expect(
      context.auth.getSession({ requireFresh: true })
    ).resolves.toEqual(session);
    expect(fetchQuery).toHaveBeenCalledTimes(2);
  });
});
