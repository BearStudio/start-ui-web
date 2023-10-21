import { ReactNode } from 'react';

import { AdminPublicOnlyLayout } from '@/features/admin/AdminPublicOnlyLayout';
import { GuardPublicOnly } from '@/features/auth/GuardPublicOnly';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <GuardPublicOnly>
      <AdminPublicOnlyLayout>{children}</AdminPublicOnlyLayout>
    </GuardPublicOnly>
  );
}
