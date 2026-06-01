import { describe, expect, it, vi } from 'vitest';

import { cacheAside } from '@/modules/kernel/application/cache/cache-aside';
import type { CacheGateway } from '@/modules/kernel/application/ports/cache-gateway';
import { AppError, isAppError } from '@/modules/kernel/domain/errors/app-error';
import { DomainError } from '@/modules/kernel/domain/errors/domain-error';
import { toCacheKey } from '@/modules/kernel/domain/ids';
import { escapeLikePattern } from '@/modules/kernel/infrastructure/db/like';
import { appErrorToResponse } from '@/modules/kernel/transport/http/error-mapper';

describe('kernel primitives', () => {
  it('carries structured AppError fields', () => {
    const cause = new Error('underlying failure');
    const error = new AppError({
      code: 'TEST',
      category: 'conflict',
      status: 409,
      message: 'Readable test failure',
      details: { target: ['email'] },
      cause,
    });

    expect(error).toMatchObject({
      name: 'AppError',
      message: 'Readable test failure',
      code: 'TEST',
      category: 'conflict',
      status: 409,
      details: { target: ['email'] },
    });
    expect(error.cause).toBe(cause);
    expect(isAppError(error)).toBe(true);
  });

  it('uses the error code as the default AppError message', () => {
    const error = new AppError({
      code: 'TEST',
      category: 'conflict',
      status: 409,
    });

    expect(error.name).toBe('AppError');
    expect(error.message).toBe('TEST');
  });

  it('creates bad request domain errors', () => {
    const cause = new Error('invalid field');
    const error = new DomainError('INVALID_DOMAIN_VALUE', {
      message: 'Invalid domain value',
      details: { field: 'name' },
      cause,
    });

    expect(error).toMatchObject({
      name: 'DomainError',
      message: 'Invalid domain value',
      code: 'INVALID_DOMAIN_VALUE',
      category: 'bad_request',
      status: 400,
      details: { field: 'name' },
    });
    expect(error.cause).toBe(cause);
    expect(isAppError(error)).toBe(true);
  });

  it('does not expose AppError details unless explicitly allowed', async () => {
    const hidden = await appErrorToResponse(
      new AppError({
        code: 'TEST',
        category: 'conflict',
        status: 409,
        details: { target: ['email'] },
      })
    ).json();
    const exposed = await appErrorToResponse(
      new AppError({
        code: 'TEST',
        category: 'conflict',
        status: 409,
        details: { target: ['email'] },
        exposeDetails: true,
      })
    ).json();

    expect(hidden).not.toHaveProperty('details');
    expect(exposed).toHaveProperty('details', { target: ['email'] });
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
    const set = vi.fn(
      async (key: string, value: unknown, _options?: { ttlMs?: number }) => {
        store.set(key, value);
      }
    );

    const cache = {
      get: async <T>(key: string) => store.get(key) as T | undefined,
      set: set as CacheGateway['set'],
      delete: async (key: string) => {
        store.delete(key);
      },
    };
    const key = toCacheKey('k');

    await expect(cacheAside({ cache, key, load, ttlMs: 30_000 })).resolves.toBe(
      'value'
    );
    await expect(cacheAside({ cache, key, load })).resolves.toBe('value');

    expect(load).toHaveBeenCalledTimes(1);
    expect(set).toHaveBeenCalledTimes(1);
    expect(set).toHaveBeenCalledWith('k', 'value', {
      ttlMs: 30_000,
    });
  });
});
