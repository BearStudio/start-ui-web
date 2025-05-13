/* eslint-disable no-process-env */
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

const isDev = process.env.NODE_ENV
  ? process.env.NODE_ENV === 'development'
  : import.meta.env?.DEV;

const getVercelUrl = () => {
  const envUrl =
    // eslint-disable-next-line no-restricted-syntax
    import.meta.env?.VITE_VERCEL_BRANCH_URL ?? import.meta.env?.VITE_VERCEL_URL;
  return envUrl ? `https://${envUrl}` : null;
};

const skipValidation = process.env.SKIP_ENV_VALIDATION
  ? !!process.env.SKIP_ENV_VALIDATION
  : // eslint-disable-next-line no-restricted-syntax
    !!import.meta.env?.SKIP_ENV_VALIDATION;

export const envClient = createEnv({
  clientPrefix: 'VITE_',
  client: {
    VITE_BASE_URL: z
      .string()
      .url()
      .transform((v) => getVercelUrl() ?? v),
    VITE_IS_DEMO: z
      .enum(['true', 'false'])
      .optional()
      .default('false')
      .transform((v) => v === 'true'),
    VITE_ENV_NAME: z
      .string()
      .optional()
      .transform((value) => value ?? (isDev ? 'LOCAL' : undefined)),
    VITE_ENV_EMOJI: z
      .string()
      .emoji()
      .optional()
      .transform((value) => value ?? (isDev ? '🚧' : undefined)),
    VITE_ENV_COLOR: z
      .string()
      .optional()
      .transform((value) => value ?? (isDev ? 'gold' : 'plum')),
  },
  runtimeEnv: {
    ...import.meta.env,
  },
  emptyStringAsUndefined: true,
  skipValidation,
});
