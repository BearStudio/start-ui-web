import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { ReactNode } from 'react';

import { orpc } from '@/lib/orpc/client';
import { Outputs } from '@/lib/orpc/types';

import { UserAuthorization } from '@/features/user/schemas';

export const GuardAuthenticated = ({
  children,
  authorizations,
  redirect,
}: {
  children?: ReactNode;
  authorizations?: UserAuthorization[];
  redirect: string;
}) => {
  const queryClient = useQueryClient();
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

  if (!checkAuthenticated.data?.isAuthenticated) {
    queryClient.setQueryData<Outputs['auth']['checkAuthenticated']>(
      orpc.auth.checkAuthenticated.key({ type: 'query' }),
      {
        isAuthenticated: false,
      }
    );
    router.navigate({
      to: redirect,
      replace: true,
      search: {
        redirect: location.href,
      },
    });
    return null;
  }

  // If no requested authorizations, check the isAuthenticated
  if (!authorizations && checkAuthenticated.data.isAuthenticated) {
    return <>{children}</>;
  }

  if (
    checkAuthenticated.data?.authorizations &&
    checkAuthenticated.data?.isAuthenticated
  ) {
    // Check if the account has some of the requested authorizations
    return !authorizations ||
      authorizations.some((a) =>
        checkAuthenticated.data.authorizations?.includes(a)
      ) ? (
      <>{children}</>
    ) : (
      <div>Unauthorized</div> // TODO
    );
  }

  // Not supposed to be there
  return <div>Something wrong happened</div>;
};
