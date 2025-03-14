import { useRouter } from '@tanstack/react-router';
import { ReactNode } from 'react';

import { authClient } from '@/lib/auth/client';

export const GuardAuthenticated = ({
  children,
  allowedRoles,
}: {
  children?: ReactNode;
  allowedRoles?: Array<'user' | 'admin'>; // TODO get types from better auth
}) => {
  const session = authClient.useSession();
  const router = useRouter();

  if (session.isPending) {
    return <div>Loading...</div>; // TODO
  }

  if (session.error) {
    return <div>Something wrong happened</div>; // TODO
  }

  if (!session.data?.user) {
    router.navigate({
      to: '/login',
      replace: true,
      search: {
        redirect: location.href,
      },
    });
    return null;
  }

  // If no requested authorizations, check the isAuthenticated
  if (!allowedRoles) {
    return <>{children}</>;
  }

  // Check if the account has some of the requested authorizations
  return allowedRoles.includes(
    session.data?.user.role as unknown as ExplicitAny // Better check here with the better auth lib
  ) ? (
    <>{children}</>
  ) : (
    <div>Unauthorized</div> // TODO
  );
};
