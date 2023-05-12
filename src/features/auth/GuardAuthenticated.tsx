'use client';

import { ReactNode } from 'react';

import { Navigate, useLocation } from 'react-router-dom';

import { useAuthContext } from '@/features/auth/AuthContext';
import { Loader } from '@/layout/Loader';

export const GuardAuthenticated = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthContext();
  const { pathname } = useLocation();

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    const redirect =
      !pathname || ['/', '/logout'].includes(pathname)
        ? '/login'
        : `/login?redirect=${pathname}`;
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
};
