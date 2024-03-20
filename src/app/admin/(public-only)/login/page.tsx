'use client';

import { Suspense } from 'react';

import PageAdminLogin from '@/features/auth/PageAdminLogin';

export default function Page() {
  return (
    <Suspense>
      <PageAdminLogin />
    </Suspense>
  );
}
