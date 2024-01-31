'use client';

import { Suspense } from 'react';

import PageLogout from '@/features/auth/PageLogout';

export default function Page() {
  return (
    <Suspense>
      <PageLogout />
    </Suspense>
  );
}
