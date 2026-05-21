import { useLocation, useRouter } from '@tanstack/react-router';
import { ReactNode, useEffect } from 'react';

import { PageError } from '@/components/errors/page-error';
import { Spinner } from '@/components/ui/spinner';

import { Permission, Role } from '@/modules/auth';
import { authClient } from '@/modules/auth/presentation/client';
import { PageOnboarding } from '@/modules/auth/presentation/page-onboarding';

export const GuardAuthenticated = ({
  children,
  permissionApps,
}: {
  children?: ReactNode;
  permissionApps?: Permission['apps'];
}) => {
  const session = authClient.useSession();
  const router = useRouter();
  const location = useLocation();
  const user = session.data?.user;
  const hasAuthError = !!session.error;
  const isAuthenticated = !!user;

  useEffect(() => {
    if (session.isPending || hasAuthError || isAuthenticated) {
      return;
    }

    router.navigate({
      to: '/login',
      replace: true,
      search: {
        redirect: location.href,
      },
    });
  }, [hasAuthError, isAuthenticated, location.href, router, session.isPending]);

  if (session.isPending) {
    return <Spinner full className="opacity-60" />;
  }

  if (hasAuthError) {
    return <PageError type="unknown-auth-error" />;
  }

  if (!isAuthenticated) {
    return null;
  }

  // Check if onboarding is done
  if (!user.onboardedAt) {
    return <PageOnboarding />;
  }

  // Unauthorized if the user permission do not match
  if (
    permissionApps &&
    !authClient.admin.checkRolePermission({
      role: user.role as Role,
      permissions: {
        apps: permissionApps,
      },
    })
  ) {
    return <PageError type="403" />;
  }

  return <>{children}</>;
};
