import { ReactNode, Suspense } from 'react';

import { AppPublicOnlyLayout } from '@/features/app/AppPublicOnlyLayout';
import { GuardPublicOnly } from '@/features/auth/GuardPublicOnly';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <GuardPublicOnly>
        <AppPublicOnlyLayout>{children}</AppPublicOnlyLayout>
      </GuardPublicOnly>
    </Suspense>
  );
}
