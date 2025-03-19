import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const envServer = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string(),
    SESSION_EXPIRATION_IN_SECONDS: z.coerce.number().int().default(2592000), // 30 days by default
    SESSION_UPDATE_AGE_IN_SECONDS: z.coerce.number().int().default(86400), // 1 day by default

    GITHUB_CLIENT_ID: zOptionalWithReplaceMe(),
    GITHUB_CLIENT_SECRET: zOptionalWithReplaceMe(),

    GOOGLE_CLIENT_ID: zOptionalWithReplaceMe(),
    GOOGLE_CLIENT_SECRET: zOptionalWithReplaceMe(),

    DISCORD_CLIENT_ID: zOptionalWithReplaceMe(),
    DISCORD_CLIENT_SECRET: zOptionalWithReplaceMe(),

    EMAIL_SERVER: z.string().url(),
    EMAIL_FROM: z.string(),

    LOGGER_LEVEL: z
      .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
      .default(import.meta.env.PROD ? 'error' : 'info'),
    LOGGER_PRETTY: z
      .enum(['true', 'false'])
      .default(import.meta.env.PROD ? 'false' : 'true')
      .transform((value) => value === 'true'),
  },
  // eslint-disable-next-line no-process-env
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

function zOptionalWithReplaceMe() {
  return z
    .string()
    .optional()
    .refine(
      (value) =>
        // Check in prodution if the value is not REPLACE ME
        !import.meta.env.PROD || value !== 'REPLACE ME',
      {
        message: 'Update the value "REPLACE ME" or remove the variable',
      }
    )
    .transform((value) => (value === 'REPLACE ME' ? undefined : value));
}
