import { ReactNode, Suspense } from 'react';

import { AdminLayout } from '@/features/admin/AdminLayout';
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
        authorizations={['ADMIN']}
        loginPath={ROUTES_AUTH.admin.login()}
      >
        <AdminLayout>{children}</AdminLayout>
      </GuardAuthenticated>
    </Suspense>
  );
}
