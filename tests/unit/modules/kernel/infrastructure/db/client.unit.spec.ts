import { makeTestDatabaseUrl } from '@tests/server/test-database-url';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { ConfigurationError } from '@/modules/kernel/domain/errors/configuration-error';
import type {
  Database,
  DbTransaction,
} from '@/modules/kernel/infrastructure/db/client';

vi.unmock('@/modules/kernel/infrastructure/db/client');

const databaseUrl = makeTestDatabaseUrl({ protocol: 'postgresql' });

describe('database client', () => {
  let createDbClient: typeof import('@/modules/kernel/infrastructure/db/client').createDbClient;
  let createTransactionRunner: typeof import('@/modules/kernel/infrastructure/db/client').createTransactionRunner;
  const clients: Array<
    ReturnType<
      typeof import('@/modules/kernel/infrastructure/db/client').createDbClient
    >
  > = [];

  beforeAll(async () => {
    ({ createDbClient, createTransactionRunner } =
      await import('@/modules/kernel/infrastructure/db/client'));
  });

  afterEach(async () => {
    await Promise.all(clients.map((client) => client.$close()));
    clients.length = 0;
  });

  it('defaults explicit URLs to the node-pg driver', () => {
    const db = createDbClient({ url: databaseUrl });
    clients.push(db);

    expect(db.$driver).toBe('node-pg');
    expect(db.$transactionCapable).toBe(true);
  });

  it('can create a Neon HTTP client without transaction capability', () => {
    const db = createDbClient({ driver: 'neon-http', url: databaseUrl });
    clients.push(db);

    expect(db.$driver).toBe('neon-http');
    expect(db.$transactionCapable).toBe(false);
    expect(() => createTransactionRunner(db)).not.toThrow();
  });

  it('can create a Neon WebSocket client with transaction capability', () => {
    const db = createDbClient({ driver: 'neon-websocket', url: databaseUrl });
    clients.push(db);

    expect(db.$driver).toBe('neon-websocket');
    expect(db.$transactionCapable).toBe(true);
  });

  it('defers missing transaction support errors until runner execution', async () => {
    const db = {
      $driver: 'neon-http',
      $transactionCapable: false,
    } as unknown as Database;
    const runner = createTransactionRunner(db);

    await expect(runner.run(async () => 'unreachable')).rejects.toThrow(
      ConfigurationError
    );
  });

  it('delegates transaction runner work to database transaction metadata', async () => {
    const tx = {} as DbTransaction;
    const runInTransaction = vi.fn(
      async <T>(work: (transaction: DbTransaction) => Promise<T>) => work(tx)
    );
    const db = {
      $driver: 'neon-http',
      $transactionCapable: false,
      $runInTransaction: runInTransaction,
    } as unknown as Database;
    const work = vi.fn(async (transaction: DbTransaction) => ({
      transaction,
    }));

    const transactionOptions = { isolationLevel: 'serializable' } as const;

    await expect(
      createTransactionRunner(db).run(work, transactionOptions)
    ).resolves.toEqual({
      transaction: tx,
    });
    expect(runInTransaction).toHaveBeenCalledWith(work, transactionOptions);
    expect(work).toHaveBeenCalledWith(tx);
  });
});
