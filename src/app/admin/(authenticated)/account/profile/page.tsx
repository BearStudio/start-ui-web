'use client';

import { Suspense } from 'react';

import PageAdminProfile from '@/features/account/PageAdminProfile';

export default function Page() {
  return (
    <Suspense>
      <PageAdminProfile />
    </Suspense>
  );
}
