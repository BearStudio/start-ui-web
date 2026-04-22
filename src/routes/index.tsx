import { createFileRoute, redirect } from '@tanstack/react-router';

import { getAuthSession } from '@/features/auth/session.server';

export const Route = createFileRoute('/')({
  component: RouteComponent,
  beforeLoad: async () => {
    const authSession = await getAuthSession();
    throw redirect({ to: authSession?.session ? '/app' : '/login' });
  },
});

function RouteComponent() {
  return null;
}
