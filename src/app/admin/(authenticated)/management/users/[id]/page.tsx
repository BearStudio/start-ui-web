'use client';

import { Suspense } from 'react';

import PageAdminUserUpdate from '@/features/users/PageAdminUserUpdate';

export default function Page() {
  return (
    <Suspense>
      <PageAdminUserUpdate />
    </Suspense>
  );
}
