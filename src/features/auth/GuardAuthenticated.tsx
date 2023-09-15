'use client';

import { ReactNode, useEffect } from 'react';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';

import { Loader } from '@/layout/Loader';

export const GuardAuthenticated = ({ children }: { children: ReactNode }) => {
  const session = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (session.status === 'unauthenticated') {
      const redirect =
        !pathname || ['/', '/logout'].includes(pathname)
          ? '/login'
          : `/login?redirect=${pathname}`;

      router.replace(redirect);
    }
  }, [pathname, router, session.status]);

  if (session.status !== 'authenticated') {
    return <Loader />;
  }

  return <>{children}</>;
};
