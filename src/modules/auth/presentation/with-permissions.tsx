import { ReactNode } from 'react';

import { Permission, Role } from '@/modules/auth';

import { checkRolePermission, useAuthSession } from './client';

export const WithPermissions = (props: {
  permissions: Permission[];
  children?: ReactNode;
  loadingFallback?: ReactNode;
  fallback?: ReactNode;
}) => {
  const session = useAuthSession();
  const userRole = session.data?.user.role;

  if (session.isPending) {
    return props.loadingFallback ?? props.fallback ?? null;
  }

  if (
    !userRole ||
    props.permissions.every(
      (permissions) =>
        !checkRolePermission({
          role: userRole as Role,
          permissions,
        })
    )
  ) {
    return props.fallback ?? null;
  }

  return props.children;
};
