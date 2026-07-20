import { ReactNode } from 'react';

import { authClient } from '@/features/auth/client';
import { Permission, Role } from '@/features/auth/permissions';
import { useSession } from '@/features/auth/use-session';

export const WithPermissions = (props: {
  permissions: Permission[];
  children?: ReactNode;
  loadingFallback?: ReactNode;
  fallback?: ReactNode;
}) => {
  const session = useSession();
  const userRole = session.data?.user.role;

  if (session.isPending) {
    return props.loadingFallback ?? props.fallback ?? null;
  }

  if (
    !userRole ||
    props.permissions.every(
      (permissions) =>
        !authClient.admin.checkRolePermission({
          role: userRole as Role,
          permissions,
        })
    )
  ) {
    return props.fallback ?? null;
  }

  return props.children;
};
