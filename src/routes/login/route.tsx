import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { PageError } from '@/platform/components/errors/page-error';

import { hasRolePermission, type Role } from '@/modules/auth';
import { LayoutLogin } from '@/modules/auth/presentation';

export const Route = createFileRoute('/login')({
  // Redirect already-authenticated users away from the login surface before
  // any layout shell paints. The destination mirrors useRedirectAfterLogin():
  // honor an explicit `redirect` search param, otherwise route by role.
  beforeLoad: async ({ context, search }) => {
    const session = await context.auth.getSession();
    if (!session) return;

    const explicitRedirect = (search as { redirect?: string }).redirect;
    if (explicitRedirect && explicitRedirect.startsWith('/')) {
      throw redirect({ to: explicitRedirect, replace: true });
    }

    const role = session.user.role as Role | undefined;
    if (role && hasRolePermission(role, { apps: ['manager'] })) {
      throw redirect({ to: '/manager', replace: true });
    }
    if (role && hasRolePermission(role, { apps: ['app'] })) {
      throw redirect({ to: '/app', replace: true });
    }
    throw redirect({ to: '/', replace: true });
  },
  component: RouteComponent,
  notFoundComponent: () => <PageError type="404" />,
  errorComponent: () => <PageError type="error-boundary" />,
});

function RouteComponent() {
  return (
    <LayoutLogin>
      <Outlet />
    </LayoutLogin>
  );
}
