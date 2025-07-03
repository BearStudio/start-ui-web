/* eslint-disable no-process-env */
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

const envMetaOrProcess: Record<string, string> = import.meta.env ?? process.env;

const isDev = process.env.NODE_ENV
  ? process.env.NODE_ENV === 'development'
  : import.meta.env?.DEV;

const getBaseUrl = () => {
  const vercelUrl =
    envMetaOrProcess.VITE_VERCEL_BRANCH_URL ?? envMetaOrProcess.VITE_VERCEL_URL;

  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  return envMetaOrProcess.VITE_BASE_URL;
};

export const envClient = createEnv({
  clientPrefix: 'VITE_',
  client: {
    VITE_BASE_URL: z.string().url(),
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
    ...envMetaOrProcess,
    VITE_BASE_URL: getBaseUrl(),
  },
  emptyStringAsUndefined: true,
  skipValidation: !!envMetaOrProcess.SKIP_ENV_VALIDATION,
});
