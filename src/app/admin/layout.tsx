import { ReactNode, Suspense } from 'react';

import { NextLoader } from '@/app/NextLoader';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <NextLoader lightColor="white" darkColor="white" />
      {children}
    </Suspense>
  );
}
