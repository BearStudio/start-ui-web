/**
 * HTTP exposure policy for the Better Auth catch-all route (`/api/auth/$`).
 *
 * Better Auth's `admin` and `openAPI` plugins register HTTP endpoints under the
 * auth base path. The `admin` plugin must stay registered because the app calls
 * its *server-side* API (`auth.api.userHasPermission`, `removeUser`, …) directly
 * in-process — those calls bypass the HTTP `handler(request)` path entirely.
 *
 * This module decides, per inbound HTTP pathname, whether an endpoint group is
 * disabled and should be answered with a 404 before reaching Better Auth. The
 * server-side `auth.api.*` calls are unaffected by these flags.
 */

export const DEFAULT_BETTER_AUTH_BASE_PATH = '/api/auth';

export type AuthHttpExposureFlags = {
  /** Better Auth base path. Defaults to `/api/auth`. */
  basePath?: string;
  /** Expose Better Auth's `/admin/*` HTTP endpoints. */
  adminEndpointsEnabled: boolean;
  /** Expose `/open-api/generate-schema` and the `/reference` page. */
  openApiEnabled: boolean;
};

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

/**
 * True when `pathname` is exactly `prefix` or sits directly beneath it
 * (next character is a `/`). Avoids matching unrelated siblings such as
 * `/api/auth/administrate` against the `/api/auth/admin` prefix.
 */
const isUnderPrefix = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

export const isBlockedBetterAuthHttpPath = (
  pathname: string,
  flags: AuthHttpExposureFlags
): boolean => {
  const basePath = trimTrailingSlash(
    flags.basePath ?? DEFAULT_BETTER_AUTH_BASE_PATH
  );

  if (
    !flags.adminEndpointsEnabled &&
    isUnderPrefix(pathname, `${basePath}/admin`)
  ) {
    return true;
  }

  if (
    !flags.openApiEnabled &&
    (isUnderPrefix(pathname, `${basePath}/open-api`) ||
      isUnderPrefix(pathname, `${basePath}/reference`))
  ) {
    return true;
  }

  return false;
};
