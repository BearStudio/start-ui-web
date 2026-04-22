import { useRouter } from '@tanstack/react-router';
import { ReactNode } from 'react';

import { PageError } from '@/components/errors/page-error';
import { Spinner } from '@/components/ui/spinner';

import { authClient } from '@/features/auth/client';
import { PageOnboarding } from '@/features/auth/page-onboarding';
import { Permission, Role } from '@/features/auth/permissions';
import { useSession } from '@/features/auth/use-session';

export const GuardAuthenticated = ({
  children,
  permissionApps,
}: {
  children?: ReactNode;
  permissionApps?: Permission['apps'];
}) => {
  const session = useSession();
  const router = useRouter();

  if (session.isPending) {
    return <Spinner full className="opacity-60" />;
  }

  if (session.error && session.error.status > 0) {
    return <PageError type="unknown-auth-error" />;
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

  if (!session.data.user.onboardedAt) {
    return <PageOnboarding />;
  }

  if (
    permissionApps &&
    !authClient.admin.checkRolePermission({
      role: session.data.user.role as Role,
      permissions: {
        apps: permissionApps,
      },
    })
  ) {
    return <PageError type="403" />;
  }

  return <>{children}</>;
};
