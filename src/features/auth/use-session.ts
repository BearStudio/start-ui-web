import { authClient } from '@/features/auth/client';
import { RootRouteApi } from '@/routes/__root';

/**
 * Wraps `authClient.useSession()` and, while the client-side session hook is
 * still pending on first mount, falls back to the session pre-fetched on the
 * server in the root route `beforeLoad`. This prevents content shifts after a
 * refresh for components that read session data directly (UserCard, NavUser,
 * onboarding, etc.) — they get real data on the very first render.
 *
 * Drop-in replacement for `authClient.useSession()`.
 */
export const useSession = () => {
  const session = authClient.useSession();
  const { authSession } = RootRouteApi.useRouteContext();

  if (session.isPending && authSession?.session !== undefined) {
    return {
      ...session,
      data: authSession.session satisfies typeof session.data,
      isPending: false,
    };
  }

  return session;
};
