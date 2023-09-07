'use client';

import { ReactNode } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { useAuthContext } from '@/features/auth/AuthContext';
import { Loader } from '@/layout/Loader';

export const GuardPublicOnly = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthContext();
  const searchParams = useSearchParams();
  const router = useRouter();

  if (isLoading) {
    return <Loader />;
  }

  if (isAuthenticated) {
    const redirect = searchParams?.get('redirect') ?? '/';
    router.replace(redirect);
    return null;
  }

  return <>{children}</>;
};
