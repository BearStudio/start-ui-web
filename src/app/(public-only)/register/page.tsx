'use client';

import { Suspense } from 'react';

import PageRegister from '@/features/auth/PageRegister';

export default function Page() {
  return (
    <Suspense>
      <PageRegister />
    </Suspense>
  );
}
