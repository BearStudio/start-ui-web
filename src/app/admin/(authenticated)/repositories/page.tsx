'use client';

import { Suspense } from 'react';

import PageAdminRepositories from '@/features/repositories/PageAdminRepositories';

export default function Page() {
  return (
    <Suspense>
      <PageAdminRepositories />
    </Suspense>
  );
}
