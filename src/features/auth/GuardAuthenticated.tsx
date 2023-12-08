'use client';

import { ReactNode, useEffect } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { ErrorPage } from '@/components/ErrorPage';
import { LoaderFull } from '@/components/LoaderFull';
import { useSyncAccountLanguage } from '@/features/account/useSyncAccountLanguage';
import { UserAuthorization } from '@/features/users/schemas';
import { trpc } from '@/lib/trpc/client';

export const GuardAuthenticated = ({
  children,
  authorizations,
  loginPath,
}: {
  children: ReactNode;
  authorizations?: UserAuthorization[];
  loginPath: string;
}) => {
  useSyncAccountLanguage();
  const checkAuthenticated = trpc.auth.checkAuthenticated.useQuery();

  const pathname = usePathname();
  const router = useRouter();

  // Redirect to login
  useEffect(() => {
    if (
      checkAuthenticated.isSuccess &&
      !checkAuthenticated.data.isAuthenticated
    ) {
      router.replace(`${loginPath}?redirect=${pathname || '/'}`);
    }
  }, [
    pathname,
    router,
    checkAuthenticated.isSuccess,
    checkAuthenticated.data?.isAuthenticated,
    loginPath,
  ]);

  // If no requested authorizations, check the isAuthenticated
  if (!authorizations && checkAuthenticated.data?.isAuthenticated) {
    return <>{children}</>;
  }

  if (
    checkAuthenticated.data?.authorizations &&
    checkAuthenticated.data?.isAuthenticated
  ) {
    // Check if the account has some of the requested authorizations
    return !authorizations ||
      authorizations.some(
        (a) => checkAuthenticated.data.authorizations?.includes(a)
      ) ? (
      <>{children}</>
    ) : (
      <ErrorPage errorCode={403} />
    );
  }

  if (checkAuthenticated.isError) {
    return <ErrorPage />;
  }

  return <LoaderFull />;
};
