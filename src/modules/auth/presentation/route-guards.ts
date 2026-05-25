import type { QueryClient } from '@tanstack/react-query';
import { redirect } from '@tanstack/react-router';

import type { Permission, Role } from '@/modules/auth';
import { hasRolePermission } from '@/modules/auth';
import { authQueries } from '@/modules/auth/client';

import {
  internalRedirectFromLocation,
  parseSafeRedirectPath,
} from './redirects';

type PermissionApp = NonNullable<Permission['apps']>[number];
type PermissionApps = [PermissionApp, ...PermissionApp[]];

type AuthRouteContext = {
  queryClient: QueryClient;
};

type RouteLocation = {
  href: string;
  pathname: string;
  searchStr?: string;
  hash?: string;
};

export class ForbiddenRouteError extends Error {
  constructor() {
    super('Forbidden route');
    this.name = 'ForbiddenRouteError';
  }
}

export const isForbiddenRouteError = (
  error: unknown
): error is ForbiddenRouteError => error instanceof ForbiddenRouteError;

const getDefaultAuthenticatedPath = (role: Role) => {
  if (hasRolePermission(role, { apps: ['manager'] })) return '/manager';
  if (hasRolePermission(role, { apps: ['app'] })) return '/app';
  return '/';
};

const getCurrentSession = (context: AuthRouteContext) =>
  context.queryClient.ensureQueryData(authQueries.currentSession());

const redirectToSafePath = (input: string | null | undefined) => {
  const safeRedirect = parseSafeRedirectPath(input);
  if (!safeRedirect) return false;
  throw redirect({
    to: safeRedirect.to,
    search: safeRedirect.search,
    replace: true,
  });
};

export async function requireAuthenticatedRoute(input: {
  context: AuthRouteContext;
  location: RouteLocation;
  permissionApps?: PermissionApps;
}) {
  const currentSession = await getCurrentSession(input.context);

  if (!currentSession) {
    throw redirect({
      to: '/login',
      search: { redirect: internalRedirectFromLocation(input.location) },
      replace: true,
    });
  }

  if (!currentSession.user.onboardedAt) {
    throw redirect({
      to: '/onboarding',
      search: { redirect: internalRedirectFromLocation(input.location) },
      replace: true,
    });
  }

  if (
    input.permissionApps &&
    !hasRolePermission(currentSession.user.role, {
      apps: input.permissionApps,
    })
  ) {
    throw new ForbiddenRouteError();
  }

  return {
    currentSession,
    session: currentSession,
    scope: currentSession.scope,
    scopeKey: currentSession.scopeKey,
  };
}

export async function requireOnboardingRoute(input: {
  context: AuthRouteContext;
  location: RouteLocation;
  redirect?: string;
}) {
  const currentSession = await getCurrentSession(input.context);

  if (!currentSession) {
    throw redirect({
      to: '/login',
      search: { redirect: internalRedirectFromLocation(input.location) },
      replace: true,
    });
  }

  if (currentSession.user.onboardedAt) {
    redirectToSafePath(input.redirect);
    throw redirect({
      to: getDefaultAuthenticatedPath(currentSession.user.role),
      replace: true,
    });
  }

  return {
    currentSession,
    session: currentSession,
    scope: currentSession.scope,
    scopeKey: currentSession.scopeKey,
  };
}

export async function redirectAuthenticatedRoute(input: {
  context: AuthRouteContext;
  redirect?: string;
}) {
  const currentSession = await getCurrentSession(input.context);

  if (!currentSession) return;

  if (!currentSession.user.onboardedAt) {
    const safeRedirect = parseSafeRedirectPath(input.redirect);
    throw redirect({
      to: '/onboarding',
      search: safeRedirect
        ? { redirect: normalizeRedirectForSearch(input.redirect) }
        : undefined,
      replace: true,
    });
  }

  redirectToSafePath(input.redirect);

  throw redirect({
    to: getDefaultAuthenticatedPath(currentSession.user.role),
    replace: true,
  });
}

const normalizeRedirectForSearch = (input: string | null | undefined) =>
  input?.trim() ?? '';
