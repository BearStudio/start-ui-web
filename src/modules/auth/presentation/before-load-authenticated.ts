import { redirect } from '@tanstack/react-router';

import { hasRolePermission, type Permission, type Role } from '@/modules/auth';
import type { AuthSessionLike } from '@/platform/router/context';

import { internalRedirectFromLocation } from './redirects';

type BeforeLoadContext = {
  context: {
    auth: { getSession: () => Promise<AuthSessionLike | null> };
  };
  location: { pathname: string; searchStr?: string; hash?: string };
};

/**
 * Resolves auth/onboarding/role-permission gating for an entire route subtree.
 * Returns the session for child loaders and components to read via
 * `Route.useRouteContext()`. Behavior:
 *
 *  - No session → throw redirect to `/login` with the current internal path
 *    preserved as the `redirect` search param.
 *  - Session but user not onboarded (and not currently on `/onboarding`) →
 *    throw redirect to `/onboarding`.
 *  - Session present but role lacks the requested `permissionApps` → throw
 *    redirect to `/`. (The root redirects unauthenticated users to `/login`,
 *    so this is effectively a "you don't have access to this app" landing.)
 *
 * Replaces component-level `<GuardAuthenticated>`. Runs in `beforeLoad`, so
 * the redirect happens before any layout shell paints.
 */
export const beforeLoadAuthenticated =
  (opts: { permissionApps: Permission['apps'] }) =>
  async ({ context, location }: BeforeLoadContext) => {
    const session = await context.auth.getSession();

    if (!session) {
      throw redirect({
        to: '/login',
        search: { redirect: internalRedirectFromLocation(location) },
        replace: true,
      });
    }

    if (!session.user.onboardedAt && location.pathname !== '/onboarding') {
      throw redirect({ to: '/onboarding', replace: true });
    }

    if (
      opts.permissionApps &&
      !hasRolePermission(session.user.role as Role, {
        apps: opts.permissionApps,
      })
    ) {
      throw redirect({ to: '/', replace: true });
    }

    return { session };
  };
