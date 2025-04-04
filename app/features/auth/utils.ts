import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearch } from '@tanstack/react-router';
import { useEffect } from 'react';

import { authClient } from '@/lib/auth/client';
import { Role } from '@/lib/auth/permissions';

export const useSignOut = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async () => {
      const response = await authClient.signOut();
      if (response.error) {
        throw new Error(response.error.message);
      }
      router.navigate({ to: '/' });
      return response.data;
    },
  });
};

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
        console.log('no role');
        router.navigate({
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
          to: '/app',
        });
        return;
      }

      router.navigate({
        to: '/',
      });
    };

    exec();
  }, [searchRedirect, session.isPending, session.data, router]);
};
