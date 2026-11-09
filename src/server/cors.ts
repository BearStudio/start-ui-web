import { envClient } from '@/env/client';
import { envServer } from '@/env/server';

/**
 * Origins allowed to call the API cross-origin.
 * oRPC v2 CORS plugin defaults to `*`, so we list them explicitly.
 */
export const corsAllowedOrigins = [
  new URL(envClient.VITE_BASE_URL).origin,
  ...(envServer.AUTH_TRUSTED_ORIGINS ?? []),
];
