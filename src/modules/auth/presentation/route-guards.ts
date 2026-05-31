import { redirect } from '@tanstack/react-router';

import type { Permission } from '@/modules/auth';
import { hasRolePermission, parseRole } from '@/modules/auth';
import type { CurrentSessionLike } from '@/platform/router/context';

import {
  internalRedirectFromLocation,
  normalizeInternalRedirect,
  parseSafeRedirectPath,
  resolvePostAuthDestination,
} from './redirects';

type PermissionApp = NonNullable<Permission['apps']>[number];
type PermissionApps = [PermissionApp, ...PermissionApp[]];

type AuthRouteContext = {
  auth: {
    getSession: () => Promise<CurrentSessionLike | null>;
  };
};

type RouteLocation = {
  href: string;
  pathname: string;
  searchStr?: string;
  hash?: string;
};

export type ForbiddenRouteContext = {
  forbiddenRoute: true;
};

const forbiddenRouteContext: ForbiddenRouteContext = {
  forbiddenRoute: true,
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

export const isForbiddenRouteContext = (
  context: unknown
): context is ForbiddenRouteContext =>
  typeof context === 'object' &&
  context !== null &&
  'forbiddenRoute' in context &&
  context.forbiddenRoute === true;

const getCurrentSession = (context: AuthRouteContext) =>
  context.auth.getSession();

const redirectToSafePath = (input: string | null | undefined) => {
  const safeRedirect = parseSafeRedirectPath(input);
  if (!safeRedirect) return false;
  throw redirect({
    to: safeRedirect.to,
    search: safeRedirect.search,
    hash: safeRedirect.hash || undefined,
    replace: true,
  });
};

const safeRedirectFromLocation = (location: RouteLocation) =>
  normalizeInternalRedirect(internalRedirectFromLocation(location)) ?? '/';

export async function requireAuthenticatedRoute(input: {
  context: AuthRouteContext;
  location: RouteLocation;
  permissionApps?: PermissionApps;
}) {
  const currentSession = await getCurrentSession(input.context);

  if (!currentSession) {
    throw redirect({
      to: '/login',
      search: { redirect: safeRedirectFromLocation(input.location) },
      replace: true,
    });
  }

  if (!currentSession.user.onboardedAt) {
    throw redirect({
      to: '/onboarding',
      search: { redirect: safeRedirectFromLocation(input.location) },
      replace: true,
    });
  }

  const role = parseRole(currentSession.user.role);
  if (
    input.permissionApps &&
    (!role || !hasRolePermission(role, { apps: input.permissionApps }))
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

export async function requireAuthenticatedRouteOrForbidden(input: {
  context: AuthRouteContext;
  location: RouteLocation;
  permissionApps?: PermissionApps;
}) {
  try {
    return await requireAuthenticatedRoute(input);
  } catch (error) {
    if (isForbiddenRouteError(error)) {
      return forbiddenRouteContext;
    }

    throw error;
  }
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
      search: { redirect: safeRedirectFromLocation(input.location) },
      replace: true,
    });
  }

  if (currentSession.user.onboardedAt) {
    redirectToSafePath(input.redirect);
    throw redirect({
      to: resolvePostAuthDestination(currentSession.user),
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
    const normalizedRedirect = safeRedirect
      ? normalizeRedirectForSearch(input.redirect)
      : undefined;
    throw redirect({
      to: '/onboarding',
      search: normalizedRedirect ? { redirect: normalizedRedirect } : undefined,
      replace: true,
    });
  }

  redirectToSafePath(input.redirect);

  throw redirect({
    to: resolvePostAuthDestination(currentSession.user),
    replace: true,
  });
}

const normalizeRedirectForSearch = (input: string | null | undefined) =>
  input?.trim() || undefined;
