'use client';

import { ReactNode, useEffect } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { ErrorPage } from '@/components/ErrorPage';
import { LoaderFull } from '@/components/LoaderFull';
import { useCheckAuthenticated } from '@/features/auth/hooks';
import { trpc } from '@/lib/trpc/client';

export const GuardAdminAuthenticated = ({
  children,
}: {
  children: ReactNode;
}) => {
  const checkAuthenticated = useCheckAuthenticated();
  const account = trpc.account.get.useQuery(undefined, {
    retry: 1,
    enabled: !!checkAuthenticated.data?.isAuthenticated,
  });

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (
      checkAuthenticated.isSuccess &&
      !checkAuthenticated.data.isAuthenticated
    ) {
      router.replace(`/login?redirect=${pathname ?? '/'}`);
    }
  }, [pathname, router, checkAuthenticated.isSuccess, checkAuthenticated.data]);

  if (account.isSuccess && account.data.role === 'ADMIN') {
    return <>{children}</>;
  }

  if (account.isSuccess && account.data.role !== 'ADMIN') {
    return <ErrorPage errorCode={403} />;
  }

  if (checkAuthenticated.isError || account.isError) {
    return <ErrorPage />;
  }

  return <LoaderFull />;
};
