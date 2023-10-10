'use client';

import { ReactNode, useEffect } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { Loader } from '@/layout/Loader';
import { trpc } from '@/lib/trpc/client';

export const GuardAuthenticated = ({ children }: { children: ReactNode }) => {
  const checkAuthenticated = trpc.auth.checkAuthenticated.useQuery(undefined, {
    staleTime: 30000,
    cacheTime: Infinity,
  });
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (
      checkAuthenticated.isSuccess &&
      !checkAuthenticated.data.isAuthenticated
    ) {
      const redirect =
        !pathname || ['/', '/logout'].includes(pathname)
          ? '/login'
          : `/login?redirect=${pathname}`;

      router.replace(redirect);
    }
  }, [pathname, router, checkAuthenticated.isSuccess, checkAuthenticated.data]);

  if (checkAuthenticated.isLoading || !checkAuthenticated.data) {
    return <Loader />;
  }

  return <>{children}</>;
};
