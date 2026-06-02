import { getGlobalStartContext } from '@tanstack/react-start';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getGlobalStartContextMock = vi.mocked(getGlobalStartContext);

describe('router composition', () => {
  beforeEach(() => {
    getGlobalStartContextMock.mockReset();
  });

  it('passes the request CSP nonce to TanStack Router SSR options', async () => {
    getGlobalStartContextMock.mockReturnValue({
      cspNonce: 'router-nonce',
    } as never);

    const { getRouter } = await import('@/router');
    const router = getRouter() as ExplicitAny;

    expect(router.options.ssr?.nonce).toBe('router-nonce');
  }, 10_000);

  it('creates a router when Start context is not available', async () => {
    getGlobalStartContextMock.mockImplementation(() => {
      throw new Error('Start context is not ready');
    });

    const { getRouter } = await import('@/router');

    expect(() => getRouter()).not.toThrow();
  });
});
