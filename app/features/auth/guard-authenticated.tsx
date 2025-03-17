import { useRouter } from '@tanstack/react-router';
import { ReactNode } from 'react';

import { authClient } from '@/lib/auth/client';
import { ROLE } from '@/lib/auth/permissions';

export const GuardAuthenticated = ({
  children,
  allowedRoles,
}: {
  children?: ReactNode;
  allowedRoles?: ROLE[];
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

  // Allows if no allowedRoles restriction
  if (!allowedRoles) {
    return <>{children}</>;
  }

  // Allows if the user role is one of the allowedRoles
  if (allowedRoles.includes(session.data.user.role as ROLE)) {
    return <>{children}</>;
  }

  return (
    <div>Unauthorized</div> // TODO
  );
};
