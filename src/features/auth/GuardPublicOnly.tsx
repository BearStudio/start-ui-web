'use client';

import { ReactNode, useEffect } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { LoaderFull } from '@/components/LoaderFull';
import { trpc } from '@/lib/trpc/client';

export const GuardPublicOnly = ({ children }: { children: ReactNode }) => {
  const checkAuthenticated = trpc.auth.checkAuthenticated.useQuery(undefined, {
    staleTime: 30000,
    cacheTime: Infinity,
  });
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
    checkAuthenticated.isLoading ||
    checkAuthenticated.data?.isAuthenticated
  ) {
    return <LoaderFull />;
  }

  return <>{children}</>;
};
