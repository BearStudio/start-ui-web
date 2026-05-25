import { createServerFn, createServerOnlyFn } from '@tanstack/react-start';

import type { AuthSession } from '@/modules/auth';

/**
 * Fetch the current Better Auth session from request cookies. Used by route
 * `beforeLoad` via `context.auth.getSession()` so authentication and
 * onboarding gating happens before any layout shell paints.
 *
 * The composition import + `getRequestHeaders` call live inside
 * `createServerOnlyFn` so TanStack Start's import protection strips them
 * from the client bundle. The exported server function itself is
 * isomorphic — it becomes a fetch on the client and runs inline on the
 * server.
 *
 * Same-origin only.
 */
const resolveSession = createServerOnlyFn(
  async (): Promise<AuthSession | null> => {
    const [{ getAuthUseCases }, { getRequestHeaders }] = await Promise.all([
      import('@/composition/auth'),
      import('@tanstack/react-start/server'),
    ]);
    return getAuthUseCases().getCurrentSession({
      headers: getRequestHeaders(),
    });
  }
);

export const fetchSession = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AuthSession | null> => resolveSession()
);
