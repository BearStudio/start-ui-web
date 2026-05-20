import { describe, expect, it, vi } from 'vitest';

import { cacheAside } from '@/modules/kernel/application/cache/cache-aside';
import { AppError } from '@/modules/kernel/domain/errors/app-error';
import { zBookId, zEmailAddress, zUserId } from '@/modules/kernel/domain/ids';
import { escapeLikePattern } from '@/modules/kernel/infrastructure/db/like';

describe('kernel primitives', () => {
  it('parses CUID-compatible branded IDs and email addresses', () => {
    expect(zUserId().parse('cm123')).toBe('cm123');
    expect(zBookId().parse('book-1')).toBe('book-1');
    expect(zEmailAddress().parse('user@example.com')).toBe('user@example.com');
    expect(() => zUserId().parse('')).toThrow();
  });

  it('carries structured AppError fields', () => {
    const error = new AppError({
      code: 'TEST',
      category: 'conflict',
      status: 409,
      details: { target: ['email'] },
    });

    expect(error).toMatchObject({
      code: 'TEST',
      category: 'conflict',
      status: 409,
      details: { target: ['email'] },
    });
  });

  it.each([
    ['', ''],
    ['%', '\\%'],
    ['_', '\\_'],
    ['\\', '\\\\'],
    ['%_\\', '\\%\\_\\\\'],
  ])('escapes LIKE pattern input %j', (input, expected) => {
    expect(escapeLikePattern(input)).toBe(expected);
  });

  it('loads through cache-aside only on misses', async () => {
    const store = new Map<string, unknown>();
    const load = vi.fn(async () => 'value');

    const cache = {
      get: async <T>(key: string) => store.get(key) as T | undefined,
      set: async <T>(key: string, value: T) => {
        store.set(key, value);
      },
      delete: async (key: string) => {
        store.delete(key);
      },
    };

    await expect(cacheAside({ cache, key: 'k', load })).resolves.toBe('value');
    await expect(cacheAside({ cache, key: 'k', load })).resolves.toBe('value');
    expect(load).toHaveBeenCalledTimes(1);
  });
});
