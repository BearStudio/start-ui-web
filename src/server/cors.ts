import { envClient } from '@/env/client';
import { auth } from '@/server/auth';

const baseOrigin = new URL(envClient.VITE_BASE_URL).origin;

/**
 * Resolves the origin allowed to call the API cross-origin.
 * oRPC v2 CORS plugin defaults to `*`, so we restrict it explicitly.
 *
 * Allows the app base origin and the origins trusted by Better Auth, so
 * `AUTH_TRUSTED_ORIGINS` patterns (e.g. `https://*.example.com`) follow the
 * same matching rules for CORS and auth. Returns the request origin when it
 * is allowed (the plugin only echoes back an exact match), `null` otherwise.
 */
export const corsAllowedOrigins = async (origin: string) => {
  if (origin === baseOrigin) return origin;
  const authContext = await auth.$context;
  return authContext.isTrustedOrigin(origin) ? origin : null;
};
