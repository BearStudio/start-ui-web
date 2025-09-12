/* eslint-disable no-process-env */
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

const isProd = process.env.NODE_ENV
  ? process.env.NODE_ENV === 'production'
  : import.meta.env?.PROD;

export const envServer = createEnv({
  server: {
    DATABASE_URL: z.url(),
    AUTH_SECRET: z.string(),
    AUTH_SESSION_EXPIRATION_IN_SECONDS: z.coerce
      .number()
      .int()
      .prefault(2592000), // 30 days by default
    AUTH_SESSION_UPDATE_AGE_IN_SECONDS: z.coerce.number().int().prefault(86400), // 1 day by default
    AUTH_TRUSTED_ORIGINS: z
      .string()
      .optional()
      .transform((stringValue) => stringValue?.split(',').map((v) => v.trim())),

    GITHUB_CLIENT_ID: zOptionalWithReplaceMe(),
    GITHUB_CLIENT_SECRET: zOptionalWithReplaceMe(),

    EMAIL_SERVER: z.url(),
    EMAIL_FROM: z.string(),

    LOGGER_LEVEL: z
      .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
      .prefault(isProd ? 'error' : 'info'),
    LOGGER_PRETTY: z
      .enum(['true', 'false'])
      .prefault(isProd ? 'false' : 'true')
      .transform((value) => value === 'true'),

    DOCKER_MINIO_API_PORT: z.string().default('9000'),
    DOCKER_MINIO_UI_PORT: z.string().default('9001'),
    DOCKER_MINIO_USERNAME: z.string(),
    DOCKER_MINIO_PASSWORD: z.string(),
    S3_ACCESS_KEY_ID: z.string(),
    S3_SECRET_ACCESS_KEY: z.string(),
    S3_BUCKET_NAME: z.string().default('default'),
    S3_REGION: z.string().default('default'),
    S3_BUCKET_PUBLIC_URL: z.string(),
    S3_ENDPOINT: z.string(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});

function zOptionalWithReplaceMe() {
  return z
    .string()
    .optional()
    .refine(
      (value) =>
        // Check in prodution if the value is not REPLACE ME
        !isProd || value !== 'REPLACE ME',
      {
        error: 'Update the value "REPLACE ME" or remove the variable',
      }
    )
    .transform((value) => (value === 'REPLACE ME' ? undefined : value));
}
