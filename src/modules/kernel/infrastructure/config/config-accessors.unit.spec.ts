import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('server config accessors', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('caches parsed database config', async () => {
    vi.stubEnv('DATABASE_URL', 'postgres://user:pass@localhost:5432/first');
    const { getDatabaseConfig } = await import('./database');

    const first = getDatabaseConfig();
    vi.stubEnv('DATABASE_URL', 'postgres://user:pass@localhost:5432/second');

    expect(getDatabaseConfig()).toBe(first);
    expect(getDatabaseConfig().databaseUrl).toBe(
      'postgres://user:pass@localhost:5432/first'
    );
    expect(getDatabaseConfig().driver).toBe('node-pg');
  });

  it('parses explicit database driver config', async () => {
    vi.stubEnv('DATABASE_URL', 'postgres://user:pass@localhost:5432/app');
    vi.stubEnv('DATABASE_DRIVER', 'neon-http');
    const { getDatabaseConfig } = await import('./database');

    expect(getDatabaseConfig()).toEqual({
      databaseUrl: 'postgres://user:pass@localhost:5432/app',
      driver: 'neon-http',
    });
  });

  it('detects likely transaction-pooled database URLs', async () => {
    const { isLikelyTransactionPooledDatabaseUrl } = await import('./database');

    expect(
      isLikelyTransactionPooledDatabaseUrl(
        'postgres://user:pass@ep-example-pooler.us-east-1.aws.neon.tech/db'
      )
    ).toBe(true);
    expect(
      isLikelyTransactionPooledDatabaseUrl(
        'postgres://user:pass@localhost:5432/db?pool_mode=transaction'
      )
    ).toBe(true);
    expect(
      isLikelyTransactionPooledDatabaseUrl(
        'postgres://user:pass@localhost:5432/db'
      )
    ).toBe(false);
  });

  it('returns null for absent optional Redis config', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', undefined);
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', undefined);
    const { getRedisConfig } = await import('./redis');

    expect(getRedisConfig()).toBeNull();
  });

  it('returns null for partial optional Redis config', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://redis.example.com');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', undefined);
    const { getRedisConfig } = await import('./redis');

    expect(getRedisConfig()).toBeNull();
  });

  it('returns Redis config when both required values are present', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://redis.example.com');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'valid-token-value');
    const { getRedisConfig } = await import('./redis');

    expect(getRedisConfig()).toEqual({
      restUrl: 'https://redis.example.com',
      restToken: 'valid-token-value',
    });
  });

  it('throws ConfigurationError for malformed Redis config', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'not-a-url');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'token-value');
    const { getRedisConfig } = await import('./redis');
    const { ConfigurationError } =
      await import('../../domain/errors/configuration-error');

    expect(() => getRedisConfig()).toThrow(ConfigurationError);
  });
});
