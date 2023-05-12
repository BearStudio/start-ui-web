'use client';

import { ReactNode } from 'react';

import { ErrorPage } from '@/components/ErrorPage';
import { useAccount } from '@/features/account/service';
import { Loader } from '@/layout/Loader';

export const GuardAdmin = ({ children }: { children: ReactNode }) => {
  const account = useAccount();

  if (account.isLoading) {
    return <Loader />;
  }

  if (!account.isAdmin) {
    return <ErrorPage errorCode={403} />;
  }

  return <>{children}</>;
};
