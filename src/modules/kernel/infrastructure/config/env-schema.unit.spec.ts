import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { makeTestDatabaseUrl } from '@/tests/server/test-database-url';

import { baseEnvSchema, parseEnv } from './env-schema';
import { ConfigurationError } from '../../domain/errors/configuration-error';

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
    expect.assertions(5);
    const schema = baseEnvSchema.extend({
      SECRET_TOKEN: z.string().min(32),
      SERVICE_URL: z.url(),
    });
    const secret = 'short-secret-value';

    try {
      parseEnv(schema, {
        SECRET_TOKEN: secret,
        SERVICE_URL: 'not-a-url',
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigurationError);
      expect(error).toMatchObject({
        message: expect.stringContaining('SECRET_TOKEN'),
      });
      expect(error).toMatchObject({
        message: expect.stringContaining('SERVICE_URL'),
      });
      expect((error as Error).message).not.toContain(secret);
      expect((error as Error).cause).toBeInstanceOf(z.ZodError);
    }
  });
});
