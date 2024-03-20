'use client';

import { Suspense } from 'react';

import PageAdminUsers from '@/features/users/PageAdminUsers';

export default function Page() {
  return (
    <Suspense>
      <PageAdminUsers />
    </Suspense>
  );
}
