import { getRequestHeaders } from '@tanstack/react-start/server';

import { auth } from '@/server/auth';

/**
 * Server-only helper that pre-fetches the current session so the first paint
 * after a refresh can skip the central spinner. Called from the root route
 * `beforeLoad` during SSR and exposed through the route context.
 */
export type AuthSession = Awaited<ReturnType<typeof getAuthSession>>;

export const getAuthSession = async () => {
  const session = await auth.api.getSession({
    headers: getRequestHeaders(),
  });

  return {
    session: session ?? null,
  } as const;
};
