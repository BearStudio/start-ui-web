import { hasRolePermission, type Role } from '@/modules/auth';
import type { CurrentSessionLike } from '@/platform/router/context';

export type InternalRedirectPath = `/${string}`;
export type PostAuthDestination = '/' | '/app' | '/manager';
export type ParsedSafeRedirectPath = {
  to: InternalRedirectPath;
  search: Record<string, string>;
};

type RedirectLocation = {
  pathname: string;
  searchStr?: string;
  hash?: string;
};

const hasSingleLeadingSlash = (value: string): value is InternalRedirectPath =>
  value.startsWith('/') && !value.startsWith('//');

const authLoopPaths = new Set(['/login', '/login/verify', '/login/error']);

const isAuthLoopPath = (pathname: string) =>
  pathname === '/logout' ||
  authLoopPaths.has(pathname) ||
  pathname.startsWith('/login/');

export const parseSafeRedirectPath = (
  value?: string | null
): ParsedSafeRedirectPath | null => {
  const redirect = value?.trim();
  if (!redirect || !hasSingleLeadingSlash(redirect)) return null;

  let url: URL;
  try {
    url = new URL(redirect, 'http://localhost');
  } catch {
    return null;
  }

  if (!hasSingleLeadingSlash(url.pathname) || isAuthLoopPath(url.pathname)) {
    return null;
  }

  return {
    to: url.pathname as InternalRedirectPath,
    search: Object.fromEntries(url.searchParams),
  };
};

export const normalizeInternalRedirect = (
  value?: string | null
): InternalRedirectPath | undefined => {
  const parsed = parseSafeRedirectPath(value);
  if (!parsed) return undefined;
  const url = new URL(value?.trim() ?? '/', 'http://localhost');
  return `${parsed.to}${url.search}${url.hash}` as InternalRedirectPath;
};

export const internalRedirectFromLocation = (
  location: RedirectLocation
): InternalRedirectPath => {
  const pathname = normalizeInternalRedirect(location.pathname) ?? '/';
  const search = location.searchStr
    ? location.searchStr.startsWith('?')
      ? location.searchStr
      : `?${location.searchStr}`
    : '';
  const hash = location.hash
    ? location.hash.startsWith('#')
      ? location.hash
      : `#${location.hash}`
    : '';

  return `${pathname}${search}${hash}` as InternalRedirectPath;
};

export const resolvePostAuthDestination = (
  user: Pick<CurrentSessionLike['user'], 'role'> | { role?: string | null }
): PostAuthDestination => {
  const role = user.role as Role | undefined;
  if (role && hasRolePermission(role, { apps: ['manager'] })) {
    return '/manager';
  }
  if (role && hasRolePermission(role, { apps: ['app'] })) {
    return '/app';
  }
  return '/';
};
