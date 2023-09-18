'use client';

import { ReactNode, useEffect } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { Loader } from '@/layout/Loader';
import { trpc } from '@/lib/trpc/client';

export const GuardPublicOnly = ({ children }: { children: ReactNode }) => {
  const checkAuthenticated = trpc.auth.checkAuthenticated.useQuery(undefined, {
    staleTime: 30000,
    cacheTime: Infinity,
  });
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (checkAuthenticated.data) {
      const redirect = searchParams?.get('redirect') ?? '/';
      router.replace(redirect);
    }
  }, [searchParams, router, checkAuthenticated.data]);

  if (checkAuthenticated.isLoading || checkAuthenticated.data) {
    return <Loader />;
  }

  return <>{children}</>;
};
