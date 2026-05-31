import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { makeTestDatabaseUrl } from '@/tests/server/test-database-url';

describe('kernel composition with Neon HTTP', () => {
  let dbToClose: { $close: () => Promise<void> } | undefined;

  beforeEach(() => {
    vi.resetModules();
    vi.doUnmock('@/modules/kernel/infrastructure/db/client');
    vi.stubEnv('DATABASE_URL', makeTestDatabaseUrl());
    vi.stubEnv('DATABASE_DRIVER', 'neon-http');
  });

  afterEach(async () => {
    await dbToClose?.$close();
    dbToClose = undefined;
    vi.unstubAllEnvs();
  });

  it('builds the default kernel without opening a transaction', async () => {
    const { __resetKernelComposition, getKernel } = await import('../kernel');

    const kernel = getKernel();
    dbToClose = kernel.db;

    expect(kernel.db.$driver).toBe('neon-http');
    expect(kernel.db.$transactionCapable).toBe(false);
    expect(() => getKernel()).not.toThrow();

    __resetKernelComposition();
  });
});
