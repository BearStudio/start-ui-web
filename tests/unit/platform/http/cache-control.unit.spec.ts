import { describe, expect, it } from 'vitest';

import {
  cachePrivateNoStore,
  cachePrivateShortLived,
  cachePublic,
} from '@/platform/http/cache-control';

describe('cache-control helpers', () => {
  it('builds private no-store cache control for personalized responses', () => {
    expect(cachePrivateNoStore()).toBe('private, no-store');
  });

  it('builds short-lived private cache headers with floored max-age and vary', () => {
    expect(cachePrivateShortLived(60.9)).toEqual({
      cacheControl: 'private, max-age=60',
      vary: 'Cookie, Authorization',
    });
  });

  it.each([-1, Number.POSITIVE_INFINITY, Number.NaN])(
    'rejects invalid private max-age values: %s',
    (maxAgeSeconds) => {
      expect(() => cachePrivateShortLived(maxAgeSeconds)).toThrow(
        'maxAgeSeconds must be a non-negative finite number'
      );
    }
  );

  it('builds public cache control only when the call site explains why it is safe', () => {
    expect(
      cachePublic({
        maxAgeSeconds: 300.7,
        reason: 'static marketing copy',
      })
    ).toBe('public, max-age=300');

    expect(
      cachePublic({
        maxAgeSeconds: 300,
        staleWhileRevalidateSeconds: 0,
        reason: 'static marketing copy',
      })
    ).toBe('public, max-age=300, stale-while-revalidate=0');
  });

  it('rejects missing public cache reasons and invalid max-age values', () => {
    expect(() => cachePublic({ maxAgeSeconds: 300, reason: '   ' })).toThrow(
      'cachePublic() requires an explicit reason explaining why the response is safe to share across users.'
    );
    expect(() =>
      cachePublic({
        maxAgeSeconds: Number.NEGATIVE_INFINITY,
        reason: 'static marketing copy',
      })
    ).toThrow('maxAgeSeconds must be a non-negative finite number');
  });

  it('omits stale-while-revalidate when it is absent or negative', () => {
    expect(
      cachePublic({
        maxAgeSeconds: 120,
        staleWhileRevalidateSeconds: -1,
        reason: 'static marketing copy',
      })
    ).toBe('public, max-age=120');
  });
});
