/* eslint-disable no-restricted-syntax */
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const envClient = createEnv({
  clientPrefix: 'VITE_',
  client: {
    VITE_BASE_URL: z.string().url(),
  },
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
});
