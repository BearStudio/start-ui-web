'use client';

import { ReactNode, useEffect } from 'react';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Loader } from '@/layout/Loader';

export const GuardPublicOnly = ({ children }: { children: ReactNode }) => {
  const session = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (session.status === 'authenticated') {
      const redirect = searchParams?.get('redirect') ?? '/';
      router.replace(redirect);
    }
  }, [searchParams, router, session.status]);

  if (session.status !== 'unauthenticated') {
    return <Loader />;
  }

  return <>{children}</>;
};
