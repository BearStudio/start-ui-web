import { createFileRoute, redirect } from '@tanstack/react-router';

import { authClient } from '@/features/auth/client';
import { Role } from '@/features/auth/permissions';
import { initAuthSsr } from '@/features/auth/session';

export const Route = createFileRoute('/')({
  component: RouteComponent,
  beforeLoad: async () => {
    const { authSession } = await initAuthSsr();

    if (!authSession?.session) {
      throw redirect({ to: '/login' });
    }

    if (
      authClient.admin.checkRolePermission({
        role: authSession.user.role as Role,
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
