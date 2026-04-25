import { createFileRoute, redirect } from '@tanstack/react-router';

import { authClient } from '@/features/auth/client';
import { Role } from '@/features/auth/permissions';
import { getAuthSession } from '@/features/auth/session.server';

export const Route = createFileRoute('/')({
  component: RouteComponent,
  beforeLoad: async () => {
    const authSession = await getAuthSession();

    if (!authSession?.session) {
      throw redirect({ to: '/login' });
    }

    if (
      authClient.admin.checkRolePermission({
        role: authSession.session.user.role as Role,
        permissions: {
          apps: ['manager'],
        },
      })
    ) {
      throw redirect({ to: '/manager' });
    }

    throw redirect({ to: '/app' });
  },
});

function RouteComponent() {
  return null;
}
