import { getRequestHeaders } from '@tanstack/react-start/server';

import { auth } from '@/modules/auth/server';
import type { CacheGateway } from '@/modules/kernel/application/ports/cache-gateway';
import type { Logger } from '@/modules/kernel/application/ports/logger';
import type { PermissionChecker } from '@/modules/kernel/application/ports/permission-checker';
import type { UserId } from '@/modules/kernel/domain/ids';
import { systemClock } from '@/modules/kernel/infrastructure/clock/system-clock';
import {
  type Database,
  db,
  transactionRunner,
} from '@/modules/kernel/infrastructure/db/client';
import { cuidIdGenerator } from '@/modules/kernel/infrastructure/id/nanoid';
import { logger as pinoLogger } from '@/modules/kernel/infrastructure/logger/pino';

import { hasDefinedOverrides } from './shared/overrides';
import { createCachedFactory } from './shared/singleton';

type CacheEntry = {
  value: unknown;
  expiresAt?: number;
};

const memoryCache = (): CacheGateway => {
  const entries = new Map<string, CacheEntry>();
  return {
    async get<T>(key: string) {
      const entry = entries.get(key);
      if (!entry) return undefined;
      if (entry.expiresAt !== undefined && entry.expiresAt <= Date.now()) {
        entries.delete(key);
        return undefined;
      }
      return entry.value as T;
    },
    async set<T>(key: string, value: T, options?: { ttlMs?: number }) {
      entries.set(key, {
        value,
        expiresAt:
          options?.ttlMs === undefined ? undefined : Date.now() + options.ttlMs,
      });
    },
    async delete(key: string) {
      entries.delete(key);
    },
  };
};

const productionLogger: Logger = {
  info: (event, fields) => pinoLogger.info({ event, ...fields }, event),
  warn: (event, fields) => pinoLogger.warn({ event, ...fields }, event),
  error: (event, fields) => pinoLogger.error({ event, ...fields }, event),
};

const productionPermissionChecker: PermissionChecker = {
  async hasPermission(userId: UserId, permissions) {
    const result = await auth.api.userHasPermission({
      body: { userId, permissions },
      headers: getRequestHeaders(),
    });
    if (result.error) return false;
    return result.success;
  },
};

export type Kernel = {
  db: Database;
  logger: Logger;
  clock: typeof systemClock;
  idGenerator: typeof cuidIdGenerator;
  cacheGateway: CacheGateway;
  transactionRunner: typeof transactionRunner;
  permissionChecker: PermissionChecker;
};

export type KernelOverrides = Partial<Kernel>;

const buildKernel = (overrides?: KernelOverrides): Kernel => ({
  db: overrides?.db ?? db,
  logger: overrides?.logger ?? productionLogger,
  clock: overrides?.clock ?? systemClock,
  idGenerator: overrides?.idGenerator ?? cuidIdGenerator,
  cacheGateway: overrides?.cacheGateway ?? memoryCache(),
  transactionRunner: overrides?.transactionRunner ?? transactionRunner,
  permissionChecker:
    overrides?.permissionChecker ?? productionPermissionChecker,
});

const getCachedKernel = createCachedFactory(() => buildKernel());

export function getKernel(options?: { overrides?: KernelOverrides }): Kernel {
  const overrides = options?.overrides;
  if (hasDefinedOverrides(overrides)) {
    return buildKernel(overrides);
  }
  return getCachedKernel(false);
}
