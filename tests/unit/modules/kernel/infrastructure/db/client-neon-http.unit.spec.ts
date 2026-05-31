import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeTestDatabaseUrl } from '@tests/server/test-database-url';

const mocks = vi.hoisted(() => ({
  drizzleNeonHttp: vi.fn(),
  drizzleNeonWebsocket: vi.fn(),
  drizzleNodePg: vi.fn(),
  poolEnd: vi.fn(),
  websocketDatabases: [] as Array<{
    $client: {
      end: ReturnType<typeof vi.fn>;
    };
    transaction: ReturnType<typeof vi.fn>;
  }>,
}));

vi.mock('drizzle-orm/neon-http', () => ({
  drizzle: mocks.drizzleNeonHttp,
}));

vi.mock('drizzle-orm/neon-serverless', () => ({
  drizzle: mocks.drizzleNeonWebsocket,
}));

vi.mock('drizzle-orm/node-postgres', () => ({
  drizzle: mocks.drizzleNodePg,
}));

vi.mock('pg', () => ({
  Pool: class {
    end = mocks.poolEnd;
  },
}));

vi.unmock('@/modules/kernel/infrastructure/db/client');

describe('Neon HTTP database client transaction lifecycle', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.websocketDatabases.length = 0;
    mocks.drizzleNeonHttp.mockReturnValue({});
    mocks.drizzleNeonWebsocket.mockImplementation(() => {
      let closed = false;
      const clientIndex = mocks.websocketDatabases.length;
      const database = {
        $client: {
          end: vi.fn(async () => {
            closed = true;
          }),
        },
        transaction: vi.fn(
          async <T>(work: (tx: { clientIndex: number }) => Promise<T>) => {
            if (closed) throw new Error('transaction client is closed');
            return work({ clientIndex });
          }
        ),
      };

      mocks.websocketDatabases.push(database);
      return database;
    });
  });

  it('recreates the lazy transaction client after close', async () => {
    const { createDbClient } =
      await import('@/modules/kernel/infrastructure/db/client');
    const db = createDbClient({
      driver: 'neon-http',
      url: makeTestDatabaseUrl(),
    });
    expect(db.$driver).toBe('neon-http');
    expect(db.$transactionCapable).toBe(false);
    const runInTransaction = db.$runInTransaction!;
    expect(typeof runInTransaction).toBe('function');

    await expect(
      runInTransaction(async (transaction) => ({
        clientIndex: (transaction as unknown as { clientIndex: number })
          .clientIndex,
      }))
    ).resolves.toEqual({ clientIndex: 0 });
    await db.$close();
    await expect(
      runInTransaction(async (transaction) => ({
        clientIndex: (transaction as unknown as { clientIndex: number })
          .clientIndex,
      }))
    ).resolves.toEqual({ clientIndex: 1 });

    expect(mocks.drizzleNeonWebsocket).toHaveBeenCalledTimes(2);
    expect(mocks.websocketDatabases[0]?.$client.end).toHaveBeenCalledOnce();
    expect(mocks.websocketDatabases[0]?.transaction).toHaveBeenCalledOnce();
    expect(mocks.websocketDatabases[1]?.transaction).toHaveBeenCalledOnce();
  });
});
