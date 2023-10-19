import { ReactNode } from 'react';

import { AppLayout } from '@/features/app/AppLayout';
import { APP_PATH } from '@/features/app/constants';
import { GuardAuthenticated } from '@/features/auth/GuardAuthenticated';

export default function AutenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <GuardAuthenticated
      authorizations={['APP']}
      loginPath={`${APP_PATH}/login`}
    >
      <AppLayout>{children}</AppLayout>
    </GuardAuthenticated>
  );
}
