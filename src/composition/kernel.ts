import { Result } from '@swan-io/boxed';

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
  type DbTransaction,
  getDefaultDbClient,
} from '@/modules/kernel/infrastructure/db/client';
import { cuidIdGenerator } from '@/modules/kernel/infrastructure/id/nanoid';
import {
  createPinoAppLogger,
  createPinoLogger,
} from '@/modules/kernel/infrastructure/logger/pino';

import { createCachedFactory } from './shared/singleton';
import type { Overrides } from './shared/types';
import { telemetryProxy } from './telemetry';

type CacheEntry = {
  value: unknown;
  expiresAt?: number;
};

const memoryCache = (clock: Clock): CacheGateway => {
  const entries = new Map<string, CacheEntry>();
  return {
    async get<T>(key: string) {
      const entry = entries.get(key);
      if (!entry) return undefined;
      if (
        entry.expiresAt !== undefined &&
        entry.expiresAt <= clock.now().getTime()
      ) {
        entries.delete(key);
        return undefined;
      }
      return entry.value as T;
    },
    async set<T>(key: string, value: T, options?: { ttlMs?: number }) {
      entries.set(key, {
        value,
        expiresAt:
          options?.ttlMs === undefined
            ? undefined
            : clock.now().getTime() + options.ttlMs,
      });
    },
    async delete(key: string) {
      entries.delete(key);
    },
  };
};

const createProductionLogger = (): Logger => {
  const pinoLogger = createPinoLogger();
  return createPinoAppLogger({
    pino: pinoLogger,
    telemetry: telemetryProxy,
  });
};

const createProductionPermissionChecker = (): PermissionChecker => ({
  async hasPermission(userId: UserId, permissions) {
    const [{ getRequestHeaders }, { getAuthUseCases }] = await Promise.all([
      import('@tanstack/react-start/server'),
      import('./auth'),
    ]);
    const result = await getAuthUseCases().checkPermission({
      userId,
      permissions,
      headers: getRequestHeaders(),
    });
    if (result.isError()) return Result.Error(result.getError());
    return Result.Ok(
      result.get().type === 'auth_permission_granted'
        ? { type: 'permission_granted' }
        : { type: 'permission_denied' }
    );
  },
});

export type Kernel = {
  db: Database;
  logger: Logger;
  clock: Clock;
  idGenerator: IdGenerator;
  cacheGateway: CacheGateway;
  transactionRunner: TransactionRunner<DbTransaction>;
  permissionChecker: PermissionChecker;
};

export type KernelOverrides = Overrides<Kernel>;

const buildDefaultKernel = (): Kernel => {
  const db = getDefaultDbClient();
  const clock = systemClock;
  return {
    db,
    logger: createProductionLogger(),
    clock,
    idGenerator: cuidIdGenerator,
    cacheGateway: memoryCache(clock),
    transactionRunner: createTransactionRunner(db),
    permissionChecker: createProductionPermissionChecker(),
  };
};

const factory = createCachedFactory<Kernel, KernelOverrides>(
  buildDefaultKernel
);

export const getKernel = (overrides?: KernelOverrides): Kernel => {
  if (overrides === undefined) return factory.get();

  const base = factory.get();
  const db = overrides.db ?? base.db;
  const clock = overrides.clock ?? base.clock;
  return {
    db,
    logger: overrides.logger ?? base.logger,
    clock,
    idGenerator: overrides.idGenerator ?? base.idGenerator,
    cacheGateway:
      overrides.cacheGateway ??
      (overrides.clock !== undefined ? memoryCache(clock) : base.cacheGateway),
    transactionRunner:
      overrides.transactionRunner ??
      (overrides.db !== undefined
        ? createTransactionRunner(db)
        : base.transactionRunner),
    permissionChecker: overrides.permissionChecker ?? base.permissionChecker,
  };
};

/** Test-only. */
export const __resetKernelComposition = () => factory.reset();
