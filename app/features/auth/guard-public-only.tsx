import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { ReactNode } from 'react';

import { orpc } from '@/lib/orpc/client';

export const GuardPublicOnly = ({
  children,

  redirect,
}: {
  children?: ReactNode;

  redirect: string;
}) => {
  const checkAuthenticated = useQuery(
    orpc.auth.checkAuthenticated.queryOptions({
      gcTime: 0, // Prevent cache issue
    })
  );
  const router = useRouter();

  if (checkAuthenticated.isLoading) {
    return <div>Loading...</div>; // TODO
  }

  if (checkAuthenticated.isError) {
    return <div>Something wrong happened</div>; // TODO
  }

  if (checkAuthenticated.data?.isAuthenticated) {
    router.navigate({
      to: redirect,
      replace: true,
    });
    return null;
  }

  return <>{children}</>;
};
