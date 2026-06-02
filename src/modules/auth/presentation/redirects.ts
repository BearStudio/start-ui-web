import { hasRolePermission, parseRole } from '@/modules/auth';
import type { CurrentSessionLike } from '@/platform/router/context';

export type InternalRedirectPath = `/${string}`;
export type PostAuthDestination = '/' | '/app' | '/manager';
export type ParsedSafeRedirectPath = {
  to: InternalRedirectPath;
  search: Record<string, string>;
  hash: string;
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
    to: url.pathname,
    search: Object.fromEntries(url.searchParams),
    hash: url.hash ? url.hash.slice(1) : '',
  };
};

export const normalizeInternalRedirect = (
  value?: string | null
): InternalRedirectPath | undefined => {
  const parsed = parseSafeRedirectPath(value);
  if (!parsed) return undefined;
  const url = new URL(value?.trim() ?? '/', 'http://localhost');
  return `${parsed.to}${url.search}${url.hash}`;
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

  return `${pathname}${search}${hash}`;
};

export const resolvePostAuthDestination = (
  user: Pick<CurrentSessionLike['user'], 'role'> | { role?: string | null }
): PostAuthDestination => {
  const role = parseRole(user.role);
  if (role && hasRolePermission(role, { apps: ['manager'] })) {
    return '/manager';
  }
  if (role && hasRolePermission(role, { apps: ['app'] })) {
    return '/app';
  }
  return '/';
};

export const isPostAuthDestinationUrl = (
  url: string | URL,
  destination: PostAuthDestination
) => {
  let pathname: string;
  try {
    pathname =
      typeof url === 'string'
        ? new URL(url, 'http://localhost').pathname
        : url.pathname;
  } catch {
    return false;
  }

  if (destination === '/') {
    return pathname === '/';
  }

  return pathname === destination || pathname.startsWith(`${destination}/`);
};
