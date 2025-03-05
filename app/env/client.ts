/* eslint-disable no-restricted-syntax */
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

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
      .transform(
        (value) => value ?? (import.meta.env.DEV ? 'LOCAL' : undefined)
      ),
    VITE_ENV_EMOJI: z
      .string()
      .emoji()
      .optional()
      .transform((value) => value ?? (import.meta.env.DEV ? '🚧' : undefined)),
    VITE_ENV_COLOR_SCHEME: z
      .string()
      .optional()
      .transform(
        (value) => value ?? (import.meta.env.DEV ? 'warning' : 'success')
      ),
  },
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
});
