import { ReactNode, Suspense } from 'react';

import { NextLoader } from '@/app/NextLoader';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <NextLoader showSpinner />
      {children}
    </Suspense>
  );
}
