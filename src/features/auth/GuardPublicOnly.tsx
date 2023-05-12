'use client';

import { ReactNode } from 'react';

import { Navigate, useSearchParams } from 'react-router-dom';

import { useAuthContext } from '@/features/auth/AuthContext';
import { Loader } from '@/layout/Loader';

export const GuardPublicOnly = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthContext();
  const [searchParams] = useSearchParams();

  if (isLoading) {
    return <Loader />;
  }

  if (isAuthenticated) {
    const redirect = searchParams?.get('redirect') ?? '/';
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
};
