/* eslint-disable no-process-env */
// @ts-check
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const zNodeEnv = z
  .enum(['development', 'test', 'production'])
  .default('development');

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: zNodeEnv,

    EMAIL_SERVER: z.string().url(),
    EMAIL_FROM: z.string(),
    LOGGER_LEVEL: z
      .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
      .default(process.env.NODE_ENV === 'production' ? 'error' : 'info'),
    LOGGER_PRETTY: z
      .enum(['true', 'false'])
      .default(process.env.NODE_ENV === 'production' ? 'false' : 'true')
      .transform((value) => value === 'true'),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_IS_DEMO: z
      .enum(['true', 'false'])
      .optional()
      .default('false')
      .transform((v) => v === 'true'),
    NEXT_PUBLIC_BASE_URL: z.string().url(),
    NEXT_PUBLIC_ENV_NAME: z
      .string()
      .optional()
      .transform(
        (value) =>
          value ??
          (process.env.NODE_ENV === 'development' ? 'LOCAL' : undefined)
      ),
    NEXT_PUBLIC_ENV_EMOJI: z
      .string()
      .emoji()
      .optional()
      .transform(
        (value) =>
          value ?? (process.env.NODE_ENV === 'development' ? '🚧' : undefined)
      ),
    NEXT_PUBLIC_ENV_COLOR_SCHEME: z
      .string()
      .optional()
      .transform(
        (value) =>
          value ??
          (process.env.NODE_ENV === 'development' ? 'warning' : 'success')
      ),
    NEXT_PUBLIC_NODE_ENV: zNodeEnv,
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_SERVER: process.env.EMAIL_SERVER,
    LOGGER_LEVEL: process.env.LOGGER_LEVEL,
    LOGGER_PRETTY: process.env.LOGGER_PRETTY,

    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_ENV_COLOR_SCHEME: process.env.NEXT_PUBLIC_ENV_COLOR_SCHEME,
    NEXT_PUBLIC_ENV_NAME: process.env.NEXT_PUBLIC_ENV_NAME,
    NEXT_PUBLIC_ENV_EMOJI: process.env.NEXT_PUBLIC_ENV_EMOJI,
    NEXT_PUBLIC_IS_DEMO: process.env.NEXT_PUBLIC_IS_DEMO,
    NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
