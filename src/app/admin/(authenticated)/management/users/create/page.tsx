'use client';

import { Suspense } from 'react';

import PageAdminUserCreate from '@/features/users/PageAdminUserCreate';

export default function Page() {
  return (
    <Suspense>
      <PageAdminUserCreate />
    </Suspense>
  );
}
