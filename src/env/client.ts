/* oxlint-disable node/no-process-env */
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

import { envMetaOrProcess, getBaseUrl } from '@/env/base-url';

const isDev = process.env.NODE_ENV
  ? process.env.NODE_ENV === 'development'
  : import.meta.env?.DEV;

export const envClient = createEnv({
  clientPrefix: 'VITE_',
  client: {
    VITE_BASE_URL: z.url(),
    VITE_IS_DEMO: z
      .enum(['true', 'false'])
      .optional()
      .prefault('false')
      .transform((v) => v === 'true'),
    VITE_ENV_NAME: z
      .string()
      .optional()
      .transform((value) => value ?? (isDev ? 'LOCAL' : undefined)),
    VITE_ENV_EMOJI: z
      .emoji()
      .optional()
      .transform((value) => value ?? (isDev ? '🚧' : undefined)),
    VITE_ENV_COLOR: z
      .string()
      .optional()
      .transform((value) => value ?? (isDev ? 'gold' : 'plum')),
    VITE_S3_BUCKET_PUBLIC_URL: z.url(),
  },
  runtimeEnv: {
    ...envMetaOrProcess,
    VITE_BASE_URL: getBaseUrl(),
  },
  emptyStringAsUndefined: true,
  skipValidation: !!envMetaOrProcess.SKIP_ENV_VALIDATION,
});
