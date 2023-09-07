'use client';

import { ReactNode } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { useAuthContext } from '@/features/auth/AuthContext';
import { Loader } from '@/layout/Loader';

export const GuardAuthenticated = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthContext();
  const pathname = usePathname();
  const router = useRouter();

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    const redirect =
      !pathname || ['/', '/logout'].includes(pathname)
        ? '/login'
        : `/login?redirect=${pathname}`;

    router.replace(redirect);
    return null;
  }

  return <>{children}</>;
};
