import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeTestDatabaseUrl } from '@tests/server/test-database-url';

describe('server config accessors', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv('SKIP_ENV_VALIDATION', undefined);
  });

  it('caches parsed database config', async () => {
    const firstDatabaseUrl = makeTestDatabaseUrl({
      credentialLabel: 'first',
      databaseName: 'first',
    });
    const secondDatabaseUrl = makeTestDatabaseUrl({
      credentialLabel: 'second',
      databaseName: 'second',
    });

    vi.stubEnv('DATABASE_URL', firstDatabaseUrl);
    const { getDatabaseConfig } =
      await import('@/modules/kernel/infrastructure/config/database');

    const first = getDatabaseConfig();
    vi.stubEnv('DATABASE_URL', secondDatabaseUrl);

    expect(getDatabaseConfig()).toBe(first);
    expect(getDatabaseConfig().databaseUrl).toBe(firstDatabaseUrl);
    expect(getDatabaseConfig().driver).toBe('node-pg');
  });

  it('parses explicit database driver config', async () => {
    const databaseUrl = makeTestDatabaseUrl();

    vi.stubEnv('DATABASE_URL', databaseUrl);
    vi.stubEnv('DATABASE_DRIVER', 'neon-http');
    const { getDatabaseConfig } =
      await import('@/modules/kernel/infrastructure/config/database');

    expect(getDatabaseConfig()).toEqual({
      databaseUrl,
      driver: 'neon-http',
    });
  });

  it('defaults migration config to node-pg for node-pg runtime drivers', async () => {
    const databaseUrl = makeTestDatabaseUrl();

    vi.stubEnv('DATABASE_URL', databaseUrl);
    vi.stubEnv('DATABASE_DRIVER', 'node-pg');
    const { getMigrationDatabaseConfig } =
      await import('@/modules/kernel/infrastructure/config/database');

    expect(getMigrationDatabaseConfig()).toEqual({
      databaseUrl,
      driver: 'node-pg',
    });
  });

  it.each(['neon-http', 'neon-websocket'] as const)(
    'defaults migration config to Neon WebSocket for %s runtime drivers',
    async (driver) => {
      const databaseUrl = makeTestDatabaseUrl();

      vi.stubEnv('DATABASE_URL', databaseUrl);
      vi.stubEnv('DATABASE_DRIVER', driver);
      const { getMigrationDatabaseConfig } =
        await import('@/modules/kernel/infrastructure/config/database');

      expect(getMigrationDatabaseConfig()).toEqual({
        databaseUrl,
        driver: 'neon-websocket',
      });
    }
  );

  it('uses explicit migration URL and driver config', async () => {
    const runtimeDatabaseUrl = makeTestDatabaseUrl({
      credentialLabel: 'runtime',
    });
    const migrationDatabaseUrl = makeTestDatabaseUrl({
      credentialLabel: 'migration',
    });

    vi.stubEnv('DATABASE_URL', runtimeDatabaseUrl);
    vi.stubEnv('DATABASE_DRIVER', 'neon-http');
    vi.stubEnv('DATABASE_MIGRATION_URL', migrationDatabaseUrl);
    vi.stubEnv('DATABASE_MIGRATION_DRIVER', 'node-pg');
    const { getMigrationDatabaseConfig } =
      await import('@/modules/kernel/infrastructure/config/database');

    expect(getMigrationDatabaseConfig()).toEqual({
      databaseUrl: migrationDatabaseUrl,
      driver: 'node-pg',
    });
  });

  it('rejects Neon HTTP as a migration driver', async () => {
    vi.stubEnv('DATABASE_URL', makeTestDatabaseUrl());
    vi.stubEnv('DATABASE_MIGRATION_DRIVER', 'neon-http');
    const { getMigrationDatabaseConfig } =
      await import('@/modules/kernel/infrastructure/config/database');
    const { ConfigurationError } =
      await import('@/modules/kernel/domain/errors/configuration-error');

    expect(() => getMigrationDatabaseConfig()).toThrow(ConfigurationError);
  });

  it('rejects likely transaction-pooled migration URLs', async () => {
    vi.stubEnv('DATABASE_URL', makeTestDatabaseUrl());
    vi.stubEnv(
      'DATABASE_MIGRATION_URL',
      makeTestDatabaseUrl({
        host: 'ep-example-pooler.us-east-1.aws.neon.tech',
        port: null,
      })
    );
    const { getMigrationDatabaseConfig } =
      await import('@/modules/kernel/infrastructure/config/database');
    const { ConfigurationError } =
      await import('@/modules/kernel/domain/errors/configuration-error');

    expect(() => getMigrationDatabaseConfig()).toThrow(ConfigurationError);
  });

  it('detects likely transaction-pooled database URLs', async () => {
    const { isLikelyTransactionPooledDatabaseUrl } =
      await import('@/modules/kernel/infrastructure/config/database');

    expect(
      isLikelyTransactionPooledDatabaseUrl(
        makeTestDatabaseUrl({
          databaseName: 'db',
          host: 'ep-example-pooler.us-east-1.aws.neon.tech',
          port: null,
        })
      )
    ).toBe(true);
    expect(
      isLikelyTransactionPooledDatabaseUrl(
        makeTestDatabaseUrl({
          databaseName: 'db',
          searchParams: { pool_mode: 'transaction' },
        })
      )
    ).toBe(true);
    expect(
      isLikelyTransactionPooledDatabaseUrl(
        makeTestDatabaseUrl({ databaseName: 'db' })
      )
    ).toBe(false);
  });

  it('defaults the auth provider to Better Auth', async () => {
    vi.stubEnv('AUTH_PROVIDER', undefined);
    const { getAuthProviderConfig } =
      await import('@/modules/kernel/infrastructure/config/auth');

    expect(getAuthProviderConfig()).toEqual({ provider: 'better-auth' });
  });

  it('parses WorkOS as a reserved auth provider without Better Auth secrets', async () => {
    vi.stubEnv('AUTH_PROVIDER', 'workos');
    vi.stubEnv('AUTH_SECRET', undefined);
    const { getAuthProviderConfig } =
      await import('@/modules/kernel/infrastructure/config/auth');

    expect(getAuthProviderConfig()).toEqual({ provider: 'workos' });
  });

  it('rejects reserved auth providers through the Better Auth config accessor', async () => {
    vi.stubEnv('AUTH_PROVIDER', 'workos');
    vi.stubEnv('AUTH_SECRET', undefined);
    const { getAuthConfig } =
      await import('@/modules/kernel/infrastructure/config/auth');
    const { ConfigurationError } =
      await import('@/modules/kernel/domain/errors/configuration-error');

    expect(() => getAuthConfig()).toThrow(ConfigurationError);
  });

  it('rejects short AUTH_SECRET values without exposing the value', async () => {
    expect.assertions(3);
    const weakAuthValue = ['too', 'short', 'fixture'].join('-');
    vi.stubEnv('AUTH_PROVIDER', 'better-auth');
    vi.stubEnv('AUTH_SECRET', weakAuthValue);
    const { getBetterAuthConfig } =
      await import('@/modules/kernel/infrastructure/config/auth');
    const { ConfigurationError } =
      await import('@/modules/kernel/domain/errors/configuration-error');

    let error: unknown;
    try {
      getBetterAuthConfig();
    } catch (caughtError) {
      error = caughtError;
    }

    expect(error).toBeInstanceOf(ConfigurationError);
    expect((error as Error).message).toContain('AUTH_SECRET');
    expect((error as Error).message).not.toContain(weakAuthValue);
  });

  it('rejects placeholder AUTH_SECRET values', async () => {
    vi.stubEnv('AUTH_PROVIDER', 'better-auth');
    vi.stubEnv('AUTH_SECRET', 'replace me');
    const { getBetterAuthConfig } =
      await import('@/modules/kernel/infrastructure/config/auth');
    const { ConfigurationError } =
      await import('@/modules/kernel/domain/errors/configuration-error');

    expect(() => getBetterAuthConfig()).toThrow(ConfigurationError);
  });

  it('accepts strong AUTH_SECRET values', async () => {
    vi.stubEnv('AUTH_PROVIDER', 'better-auth');
    vi.stubEnv('AUTH_SECRET', 'a'.repeat(32));
    const { getBetterAuthConfig } =
      await import('@/modules/kernel/infrastructure/config/auth');

    expect(getBetterAuthConfig().secret).toBe('a'.repeat(32));
  });

  it('allows weak AUTH_SECRET values only when env validation is skipped', async () => {
    const weakAuthValue = ['too', 'short', 'fixture'].join('-');
    vi.stubEnv('AUTH_PROVIDER', 'better-auth');
    vi.stubEnv('AUTH_SECRET', weakAuthValue);
    vi.stubEnv('SKIP_ENV_VALIDATION', 'true');
    const { getBetterAuthConfig } =
      await import('@/modules/kernel/infrastructure/config/auth');

    expect(getBetterAuthConfig().secret).toBe(weakAuthValue);
  });

  it('skips server config validation when SKIP_ENV_VALIDATION is true', async () => {
    vi.stubEnv('SKIP_ENV_VALIDATION', 'true');
    vi.stubEnv('AUTH_SECRET', undefined);
    vi.stubEnv('DATABASE_URL', undefined);

    await expect(
      import('@/modules/kernel/infrastructure/config/server')
    ).resolves.toHaveProperty('validateServerConfig');
  });

  it('returns null for absent optional Redis config', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', undefined);
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', undefined);
    const { getRedisConfig } =
      await import('@/modules/kernel/infrastructure/config/redis');

    expect(getRedisConfig()).toBeNull();
  });

  it('returns null for partial optional Redis config', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://redis.example.com');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', undefined);
    const { getRedisConfig } =
      await import('@/modules/kernel/infrastructure/config/redis');

    expect(getRedisConfig()).toBeNull();
  });

  it('returns Redis config when both required values are present', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://redis.example.com');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'valid-token-value');
    const { getRedisConfig } =
      await import('@/modules/kernel/infrastructure/config/redis');

    expect(getRedisConfig()).toEqual({
      restUrl: 'https://redis.example.com',
      restToken: 'valid-token-value',
    });
  });

  it('throws ConfigurationError for malformed Redis config', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'not-a-url');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'token-value');
    const { getRedisConfig } =
      await import('@/modules/kernel/infrastructure/config/redis');
    const { ConfigurationError } =
      await import('@/modules/kernel/domain/errors/configuration-error');

    expect(() => getRedisConfig()).toThrow(ConfigurationError);
  });

  it('requires an OpenTelemetry Collector URL in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('OTEL_COLLECTOR_URL', undefined);
    const { getTelemetryConfig } =
      await import('@/modules/kernel/infrastructure/config/telemetry');
    const { ConfigurationError } =
      await import('@/modules/kernel/domain/errors/configuration-error');

    expect(() => getTelemetryConfig()).toThrow(ConfigurationError);
    expect(() => getTelemetryConfig()).toThrow('OTEL_COLLECTOR_URL');
  });

  it('accepts production telemetry config when the Collector URL is present', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('OTEL_COLLECTOR_URL', 'https://collector.example/v1');
    const { getTelemetryConfig } =
      await import('@/modules/kernel/infrastructure/config/telemetry');

    expect(getTelemetryConfig().collectorUrl).toBe(
      'https://collector.example/v1'
    );
  });
});
