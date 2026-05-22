import type { CacheGateway } from '@/modules/kernel/application/ports/cache-gateway';
import type { Clock } from '@/modules/kernel/application/ports/clock';
import type { IdGenerator } from '@/modules/kernel/application/ports/id-generator';
import type { Logger } from '@/modules/kernel/application/ports/logger';
import type { PermissionChecker } from '@/modules/kernel/application/ports/permission-checker';
import type { TransactionRunner } from '@/modules/kernel/application/ports/transaction-runner';
import type { UserId } from '@/modules/kernel/domain/ids';
import { systemClock } from '@/modules/kernel/infrastructure/clock/system-clock';
import {
  createTransactionRunner,
  type Database,
  getDefaultDbClient,
} from '@/modules/kernel/infrastructure/db/client';
import { cuidIdGenerator } from '@/modules/kernel/infrastructure/id/nanoid';
import { createPinoLogger } from '@/modules/kernel/infrastructure/logger/pino';

import { createCachedFactory } from './shared/singleton';
import type { Overrides } from './shared/types';

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

const createProductionLogger = (): Logger => {
  const pinoLogger = createPinoLogger();
  return {
    info: (event, fields) => pinoLogger.info({ event, ...fields }, event),
    warn: (event, fields) => pinoLogger.warn({ event, ...fields }, event),
    error: (event, fields) => pinoLogger.error({ event, ...fields }, event),
  };
};

const createProductionPermissionChecker = (): PermissionChecker => ({
  async hasPermission(userId: UserId, permissions) {
    const [{ getRequestHeaders }, { getAuth }] = await Promise.all([
      import('@tanstack/react-start/server'),
      import('./auth'),
    ]);
    const result = await getAuth().api.userHasPermission({
      body: { userId, permissions },
      headers: getRequestHeaders(),
    });
    return result.error ? false : result.success;
  },
});

export type Kernel = {
  db: Database;
  logger: Logger;
  clock: Clock;
  idGenerator: IdGenerator;
  cacheGateway: CacheGateway;
  transactionRunner: TransactionRunner;
  permissionChecker: PermissionChecker;
};

export type KernelOverrides = Overrides<Kernel>;

const buildKernel = (overrides?: KernelOverrides): Kernel => ({
  db: overrides?.db ?? getDefaultDbClient(),
  logger: overrides?.logger ?? createProductionLogger(),
  clock: overrides?.clock ?? systemClock,
  idGenerator: overrides?.idGenerator ?? cuidIdGenerator,
  cacheGateway: overrides?.cacheGateway ?? memoryCache(),
  transactionRunner:
    overrides?.transactionRunner ??
    createTransactionRunner(overrides?.db ?? getDefaultDbClient()),
  permissionChecker:
    overrides?.permissionChecker ?? createProductionPermissionChecker(),
});

const factory = createCachedFactory(buildKernel);

export const getKernel = (overrides?: KernelOverrides): Kernel =>
  factory.get(overrides);

/** Test-only. */
export const __resetKernelComposition = () => factory.reset();
