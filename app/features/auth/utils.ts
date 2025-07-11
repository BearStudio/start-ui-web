import { useRouter, useSearch } from '@tanstack/react-router';
import { useEffect } from 'react';

import { authClient } from '@/features/auth/client';
import { Role } from '@/features/auth/permissions';

export const useRedirectAfterLogin = () => {
  const search = useSearch({ strict: false });
  const router = useRouter();
  const session = authClient.useSession();
  const searchRedirect = search.redirect;

  useEffect(() => {
    const exec = () => {
      if (session.isPending || !session.data) {
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
          permission: {
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
          permission: {
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
