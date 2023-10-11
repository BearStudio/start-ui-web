'use client';

import { ReactNode } from 'react';

import { ErrorPage } from '@/components/ErrorPage';
import { LoaderFull } from '@/components/LoaderFull';
import { trpc } from '@/lib/trpc/client';

export const GuardAdmin = ({ children }: { children: ReactNode }) => {
  const account = trpc.account.get.useQuery();

  if (account.isLoading) {
    return <LoaderFull />;
  }

  if (account.data?.role !== 'ADMIN') {
    return <ErrorPage errorCode={403} />;
  }

  return <>{children}</>;
};
