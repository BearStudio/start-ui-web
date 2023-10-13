'use client';

import { ReactNode, useEffect } from 'react';

import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { ErrorPage } from '@/components/ErrorPage';
import { LoaderFull } from '@/components/LoaderFull';
import { useCheckAuthenticated } from '@/features/auth/hooks';
import { trpc } from '@/lib/trpc/client';

export const GuardAuthenticated = ({
  children,
  roles,
  loginPath,
}: {
  children: ReactNode;
  roles: ('USER' | 'ADMIN')[];
  loginPath: string;
}) => {
  const { i18n } = useTranslation();
  const checkAuthenticated = useCheckAuthenticated();
  const account = trpc.account.get.useQuery(undefined, {
    retry: 1,
    enabled: roles && !!checkAuthenticated.data?.isAuthenticated,
  });

  const pathname = usePathname();
  const router = useRouter();

  // Redirect to login
  useEffect(() => {
    if (
      checkAuthenticated.isSuccess &&
      !checkAuthenticated.data.isAuthenticated
    ) {
      router.replace(`${loginPath}?redirect=${pathname ?? '/'}`);
    }
  }, [
    pathname,
    router,
    checkAuthenticated.isSuccess,
    checkAuthenticated.data,
    loginPath,
  ]);

  // Udpdate account language
  useEffect(() => {
    if (account.isSuccess) {
      i18n.changeLanguage(account.data.language);
    }
  }, [account.isSuccess, account.data?.language, i18n]);

  if (account.isSuccess) {
    // Check if the account has all requested roles
    return !roles || roles.every((r) => account.data.roles.includes(r)) ? (
      <>{children}</>
    ) : (
      <ErrorPage errorCode={403} />
    );
  }

  if (checkAuthenticated.isError || account.isError) {
    return <ErrorPage />;
  }

  return <LoaderFull />;
};
