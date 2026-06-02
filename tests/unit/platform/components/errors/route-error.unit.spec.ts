import { describe, expect, it, vi } from 'vitest';

import { retryRouteError } from '@/platform/components/errors/route-error-retry';

describe('retryRouteError', () => {
  it('resets query error state before invalidating the current route match', async () => {
    const calls: string[] = [];
    const queryClient = {
      resetQueries: vi.fn(async () => {
        calls.push('resetQueries');
      }),
    };
    const router = {
      invalidate: vi.fn(async () => {
        calls.push('invalidate');
      }),
    };

    await retryRouteError({ queryClient, router });

    expect(calls).toEqual(['resetQueries', 'invalidate']);
    expect(queryClient.resetQueries).toHaveBeenCalledOnce();
    expect(router.invalidate).toHaveBeenCalledOnce();
  });

  it('still invalidates the route match when no query client is available', async () => {
    const router = {
      invalidate: vi.fn(async () => undefined),
    };

    await retryRouteError({ router });

    expect(router.invalidate).toHaveBeenCalledOnce();
  });
});
