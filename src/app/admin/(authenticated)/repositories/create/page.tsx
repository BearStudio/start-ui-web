'use client';

import { Suspense } from 'react';

import PageAdminRepositoryCreate from '@/features/repositories/PageAdminRepositoryCreate';

export default function Page() {
  return (
    <Suspense>
      <PageAdminRepositoryCreate />
    </Suspense>
  );
}
