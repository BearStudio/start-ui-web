import { useRouter, useSearch } from '@tanstack/react-router';
import { useEffect } from 'react';

import { authClient } from '@/features/auth/client';
import { Role } from '@/features/auth/permissions';
import { useSession } from '@/features/auth/use-session';

/**
 * Allowlist for post-login redirects: same-origin paths only.
 * Rejects absolute URLs (`://`), protocol-relative URLs (`//`) and
 * backslashes (which browsers may normalize into path separators).
 */
export const isSafeRedirectPath = (redirect: unknown): redirect is string => {
  if (typeof redirect !== 'string' || redirect.length === 0) {
    return false;
  }
  if (!redirect.startsWith('/')) {
    return false;
  }
  if (redirect.startsWith('//')) {
    return false;
  }
  if (redirect.includes('://') || redirect.includes('\\')) {
    return false;
  }
  return true;
};

/**
 * Sanitize a `redirect` search param into a safe same-origin path.
 * Accepts relative paths (`/app?tab=1`) and absolute same-origin URLs
 * (as stored by `GuardAuthenticated` via `location.href`), and falls back
 * to `/` for anything else — without throwing.
 */
export const getSafeRedirect = (redirect: unknown): string => {
  if (typeof redirect !== 'string' || redirect.length === 0) {
    return '/';
  }
  if (redirect.includes('\\')) {
    return '/';
  }
  try {
    const base =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'http://localhost';
    const url = new URL(redirect, base);
    if (url.origin !== new URL(base).origin) {
      return '/';
    }
    const safePath = `${url.pathname}${url.search}${url.hash}`;
    return isSafeRedirectPath(safePath) ? safePath : '/';
  } catch {
    return '/';
  }
};

export const useRedirectAfterLogin = () => {
  const search = useSearch({ strict: false });
  const router = useRouter();
  const session = useSession();
  const searchRedirect = search.redirect;

  useEffect(() => {
    const exec = () => {
      if (session.isPending || !session.data) {
        return;
      }

      if (searchRedirect) {
        const safeRedirect = getSafeRedirect(searchRedirect);
        try {
          const redirectUrl = new URL(safeRedirect, window.location.origin);
          router.navigate({
            replace: true,
            to: redirectUrl.pathname,
            search: Object.fromEntries(redirectUrl.searchParams),
            ...(redirectUrl.hash ? { hash: redirectUrl.hash.slice(1) } : {}),
          });
        } catch {
          router.navigate({
            replace: true,
            to: '/',
          });
        }
        return;
      }

      const userRole = session.data?.user.role;

      if (!userRole) {
        router.navigate({
          replace: true,
          to: '/',
        });
        return;
      }

      if (
        authClient.admin.checkRolePermission({
          role: userRole as Role,
          permissions: {
            apps: ['manager'],
          },
        })
      ) {
        router.navigate({
          replace: true,
          to: '/manager',
        });
        return;
      }

      if (
        authClient.admin.checkRolePermission({
          role: userRole as Role,
          permissions: {
            apps: ['app'],
          },
        })
      ) {
        router.navigate({
          replace: true,
          to: '/app',
        });
        return;
      }

      router.navigate({
        replace: true,
        to: '/',
      });
    };

    exec();
  }, [searchRedirect, session.isPending, session.data, router]);
};
