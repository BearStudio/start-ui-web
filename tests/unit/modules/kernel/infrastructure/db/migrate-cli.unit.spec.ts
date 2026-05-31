import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  close: vi.fn(),
  createMigrationDbClient: vi.fn(),
  migrateDatabase: vi.fn(),
}));

vi.mock('@/modules/kernel/infrastructure/db/migrate', () => ({
  createMigrationDbClient: mocks.createMigrationDbClient,
  migrateDatabase: mocks.migrateDatabase,
}));

describe('migrate CLI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mocks.createMigrationDbClient.mockResolvedValue({ $close: mocks.close });
    mocks.migrateDatabase.mockResolvedValue(undefined);
  });

  it('runs migrations against a dedicated migration database and closes it', async () => {
    await import('@/modules/kernel/infrastructure/db/migrate-cli');

    const db = await mocks.createMigrationDbClient.mock.results[0]?.value;
    expect(mocks.migrateDatabase).toHaveBeenCalledWith(db);
    expect(mocks.close).toHaveBeenCalledOnce();
  });

  it('closes the migration database when migrations fail', async () => {
    const error = new Error('migration failed');
    mocks.migrateDatabase.mockRejectedValue(error);

    await expect(
      import('@/modules/kernel/infrastructure/db/migrate-cli')
    ).rejects.toThrow(error);

    expect(mocks.close).toHaveBeenCalledOnce();
  });
});
