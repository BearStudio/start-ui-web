import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  db: { kind: 'runtime-db' },
  drizzleDb: { kind: 'drizzle-db' },
  migrate: vi.fn(),
}));

vi.mock('drizzle-orm/postgres-js/migrator', () => ({
  migrate: hoisted.migrate,
}));

vi.mock('@/server/db', () => ({
  db: hoisted.db,
  drizzleDb: hoisted.drizzleDb,
}));

import { runDrizzleMigrations } from './migrate';

describe('runDrizzleMigrations', () => {
  beforeEach(() => {
    hoisted.migrate.mockClear();
  });

  it('runs migrations against the drizzle driver instance', async () => {
    await runDrizzleMigrations();

    expect(hoisted.migrate).toHaveBeenCalledWith(hoisted.drizzleDb, {
      migrationsFolder: 'drizzle',
    });
    expect(hoisted.migrate).not.toHaveBeenCalledWith(
      hoisted.db,
      expect.anything()
    );
  });
});
