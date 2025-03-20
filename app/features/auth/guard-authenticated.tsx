import { useRouter } from '@tanstack/react-router';
import { ReactNode } from 'react';

import { authClient, Permission } from '@/lib/auth/client';
import { ROLE } from '@/lib/auth/permissions';

import { Spinner } from '@/components/ui/spinner';

export const GuardAuthenticated = ({
  children,
  permission,
}: {
  children?: ReactNode;
  permission?: Permission;
}) => {
  const session = authClient.useSession();
  const router = useRouter();

  if (session.isPending) {
    return <Spinner full className="opacity-60" />;
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
  if (!permission) {
    return <>{children}</>;
  }

  // Allows if the user as the permission
  if (
    authClient.admin.checkRolePermission({
      role: session.data.user.role as ROLE,
      permission,
    })
  ) {
    return <>{children}</>;
  }

  return (
    <div>Unauthorized</div> // TODO
  );
};
