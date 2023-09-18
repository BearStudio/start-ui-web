'use client';

import { ReactNode } from 'react';

import { ErrorPage } from '@/components/ErrorPage';
import { Loader } from '@/layout/Loader';
import { trpc } from '@/lib/trpc/client';

export const GuardAdmin = ({ children }: { children: ReactNode }) => {
  const account = trpc.account.get.useQuery();

  if (account.isLoading) {
    return <Loader />;
  }

  if (account.data?.role !== 'ADMIN') {
    return <ErrorPage errorCode={403} />;
  }

  return <>{children}</>;
};
