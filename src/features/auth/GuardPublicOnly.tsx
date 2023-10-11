'use client';

import { ReactNode, useEffect } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { ErrorPage } from '@/components/ErrorPage';
import { LoaderFull } from '@/components/LoaderFull';
import { useCheckAuthenticated } from '@/features/auth/hooks';

export const GuardPublicOnly = ({ children }: { children: ReactNode }) => {
  const checkAuthenticated = useCheckAuthenticated();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (
      checkAuthenticated.isSuccess &&
      checkAuthenticated.data.isAuthenticated
    ) {
      const redirect = searchParams?.get('redirect') ?? '/';
      router.replace(redirect);
    }
  }, [
    searchParams,
    router,
    checkAuthenticated.isSuccess,
    checkAuthenticated.data,
  ]);

  if (
    checkAuthenticated.isSuccess &&
    !checkAuthenticated.data.isAuthenticated
  ) {
    return <>{children}</>;
  }

  if (checkAuthenticated.isError) {
    return <ErrorPage />;
  }

  return <LoaderFull />;
};
