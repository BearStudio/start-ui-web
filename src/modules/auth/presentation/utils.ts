import { useRouter, useSearch } from '@tanstack/react-router';
import { useEffect } from 'react';

import { Role } from '@/modules/auth';
import { checkRolePermission, useAuthSession } from '@/modules/auth/client';

export const useRedirectAfterLogin = () => {
  const search = useSearch({ strict: false });
  const router = useRouter();
  const session = useAuthSession();
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
        checkRolePermission({
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
        checkRolePermission({
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
