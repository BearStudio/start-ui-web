import { ReactNode } from 'react';

import { type CurrentSession, type Permission } from '@/modules/auth';

import { checkRolePermission } from './client';

type AuthSessionQuery = {
  data?: CurrentSession | null;
  isPending: boolean;
};

export const createWithPermissions =
  (useAuthSession: () => AuthSessionQuery) =>
  (props: {
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
            role: userRole,
            permissions,
          })
      )
    ) {
      return props.fallback ?? null;
    }

    return props.children;
  };
