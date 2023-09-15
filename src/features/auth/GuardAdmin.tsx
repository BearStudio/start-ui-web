'use client';

import { ReactNode } from 'react';

import { useSession } from 'next-auth/react';

import { ErrorPage } from '@/components/ErrorPage';
import { Loader } from '@/layout/Loader';

export const GuardAdmin = ({ children }: { children: ReactNode }) => {
  const session = useSession();

  if (session.status === 'loading') {
    return <Loader />;
  }

  if (session.data?.user.role !== 'ADMIN') {
    return <ErrorPage errorCode={403} />;
  }

  return <>{children}</>;
};
