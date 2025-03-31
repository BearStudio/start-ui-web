import { ReactNode } from 'react';

import { authClient, Permission } from '@/lib/auth/client';
import { Role } from '@/lib/auth/permissions';

export const WithPermission = (props: {
  permission: Permission;
  children?: ReactNode;
  loadingFallback?: ReactNode;
  fallback?: ReactNode;
}) => {
  const session = authClient.useSession();
  const userRole = session.data?.user.role;

  if (session.isPending) {
    return props.loadingFallback ?? props.fallback ?? null;
  }

  if (
    !userRole ||
    !authClient.admin.checkRolePermission({
      role: userRole as Role,
      permission: props.permission,
    })
  ) {
    return props.fallback ?? null;
  }

  return props.children;
};
