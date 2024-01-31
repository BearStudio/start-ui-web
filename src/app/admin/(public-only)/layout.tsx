import { ReactNode, Suspense } from 'react';

import { AdminPublicOnlyLayout } from '@/features/admin/AdminPublicOnlyLayout';
import { GuardPublicOnly } from '@/features/auth/GuardPublicOnly';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <GuardPublicOnly>
        <AdminPublicOnlyLayout>{children}</AdminPublicOnlyLayout>
      </GuardPublicOnly>
    </Suspense>
  );
}
