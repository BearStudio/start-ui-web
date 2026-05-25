import { hasRolePermission, type Role } from '@/modules/auth';
import type { AuthSessionLike } from '@/platform/router/context';

export type InternalRedirectPath = `/${string}`;
export type PostAuthDestination = '/' | '/app' | '/manager';

type RedirectLocation = {
  pathname: string;
  searchStr?: string;
  hash?: string;
};

const hasSingleLeadingSlash = (value: string): value is InternalRedirectPath =>
  value.startsWith('/') && !value.startsWith('//');

export const normalizeInternalRedirect = (
  value?: string | null
): InternalRedirectPath | undefined => {
  const redirect = value?.trim();
  if (!redirect || !hasSingleLeadingSlash(redirect)) {
    return undefined;
  }
  return redirect;
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
  user: Pick<AuthSessionLike['user'], 'role'>
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
