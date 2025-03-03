/* eslint-disable no-restricted-syntax */
import { createEnv } from '@t3-oss/env-core';

export const envServer = createEnv({
  server: {},
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
});
