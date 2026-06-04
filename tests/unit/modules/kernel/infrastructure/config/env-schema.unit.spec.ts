import { makeTestDatabaseUrl } from '@tests/server/test-database-url';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { ConfigurationError } from '@/modules/kernel/domain/errors/configuration-error';
import {
  baseEnvSchema,
  parseEnv,
} from '@/modules/kernel/infrastructure/config/env-schema';

function captureThrown(fn: () => unknown) {
  try {
    fn();
  } catch (error) {
    return error;
  }

  throw new Error('Expected function to throw.');
}

describe('server env parser', () => {
  it('returns parsed values and allows unknown variables', () => {
    const schema = baseEnvSchema.extend({
      DATABASE_URL: z.url(),
    });
    const databaseUrl = makeTestDatabaseUrl();

    expect(
      parseEnv(schema, {
        DATABASE_URL: databaseUrl,
        EXTRA_VALUE: 'kept',
      })
    ).toMatchObject({
      DATABASE_URL: databaseUrl,
      EXTRA_VALUE: 'kept',
    });
  });

  it('throws ConfigurationError for missing required values', () => {
    expect(() =>
      parseEnv(baseEnvSchema.extend({ DATABASE_URL: z.url() }), {})
    ).toThrow(ConfigurationError);
  });

  it('includes failing field names without exposing secret values', () => {
    const schema = baseEnvSchema.extend({
      SECRET_TOKEN: z.string().min(32),
      SERVICE_URL: z.url(),
    });
    const secret = 'short-secret-value'; // pragma: allowlist secret

    const error = captureThrown(() =>
      parseEnv(schema, {
        SECRET_TOKEN: secret,
        SERVICE_URL: 'not-a-url',
      })
    );

    expect(error).toBeInstanceOf(ConfigurationError);
    expect(error).toMatchObject({
      message: expect.stringContaining('SECRET_TOKEN'),
    });
    expect(error).toMatchObject({
      message: expect.stringContaining('SERVICE_URL'),
    });
    expect((error as Error).message).not.toContain(secret);
    expect((error as Error).cause).toBeInstanceOf(z.ZodError);
  });
});
