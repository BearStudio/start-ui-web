import { Result } from '@swan-io/boxed';

import type { Kernel } from '@/composition/kernel';
import { toGeneratedId } from '@/modules/kernel/domain/ids';

export const now = new Date('2026-01-01T00:00:00.000Z');

export function makeTestKernel(overrides: Partial<Kernel> = {}): Kernel {
  const cache = new Map<string, unknown>();
  return {
    db: {} as Kernel['db'],
    logger: {
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
    },
    clock: {
      now: () => now,
    },
    idGenerator: {
      createId: () => toGeneratedId('generated-id'),
    },
    cacheGateway: {
      async get<T>(key: string) {
        return cache.get(key) as T | undefined;
      },
      async set<T>(key: string, value: T) {
        cache.set(key, value);
      },
      async delete(key: string) {
        cache.delete(key);
      },
    },
    transactionRunner: {
      run: (work) => work({} as never),
    },
    permissionChecker: {
      hasPermission: async () => Result.Ok({ type: 'permission_granted' }),
    },
    ...overrides,
  };
}
