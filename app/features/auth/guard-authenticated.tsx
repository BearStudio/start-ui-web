import { useRouter } from '@tanstack/react-router';
import { ReactNode } from 'react';

import { authClient, Permission } from '@/lib/auth/client';
import { Role } from '@/lib/auth/permissions';

import { Spinner } from '@/components/ui/spinner';

import { PageOnboarding } from '@/features/auth/page-onboarding';

export const GuardAuthenticated = ({
  children,
  permissionApps,
}: {
  children?: ReactNode;
  permissionApps?: Permission['apps'];
}) => {
  const session = authClient.useSession();
  const router = useRouter();

  if (session.isPending) {
    return <Spinner full className="opacity-60" />;
  }

  if (session.error && session.error.status > 0) {
    return (
      <div>
        <p>Something wrong happened (auth guard)</p>
        <p>{session.error.message}</p>
        <pre>{JSON.stringify(session.error, null, 2)}</pre>
      </div>
    ); // TODO
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

  // Unauthorized if the user permission do not match
  if (
    permissionApps &&
    !authClient.admin.checkRolePermission({
      role: session.data.user.role as Role,
      permission: {
        apps: permissionApps,
      },
    })
  ) {
    return <div>Unauthorized</div>; // TODO
  }

  // Check if onboarding is done
  if (!session.data.user.onboardedAt) {
    return <PageOnboarding />;
  }

  return <>{children}</>;
};
