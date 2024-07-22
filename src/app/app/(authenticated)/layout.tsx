import { ReactNode, Suspense } from 'react';

import { AppLayout } from '@/features/app/AppLayout';
import { GuardAuthenticated } from '@/features/auth/GuardAuthenticated';
import { ROUTES_AUTH } from '@/features/auth/routes';

export default function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense>
      <GuardAuthenticated
        authorizations={['APP']}
        loginPath={ROUTES_AUTH.login()}
      >
        <AppLayout>{children}</AppLayout>
      </GuardAuthenticated>
    </Suspense>
  );
}
