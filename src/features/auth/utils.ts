import { useRouter, useSearch } from '@tanstack/react-router';
import { useEffect } from 'react';

import { authClient } from '@/features/auth/client';
import { isOAuthFlowSearch } from '@/features/auth/oauth';
import { Role } from '@/features/auth/permissions';
import { useSession } from '@/features/auth/use-session';

export const useRedirectAfterLogin = () => {
  const search = useSearch({ strict: false });
  const router = useRouter();
  const session = useSession();
  const searchRedirect = search.redirect;
  // During an OAuth authorization flow (MCP clients), Better Auth redirects
  const isOAuthFlow = isOAuthFlowSearch(search);

  useEffect(() => {
    const exec = () => {
      if (session.isPending || !session.data || isOAuthFlow) {
        return;
      }

      if (searchRedirect) {
        const redirectUrl = new URL(searchRedirect);
        router.navigate({
          replace: true,
          to: redirectUrl.pathname,
          search: Object.fromEntries(redirectUrl.searchParams),
        });
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
  }, [searchRedirect, isOAuthFlow, session.isPending, session.data, router]);
};
