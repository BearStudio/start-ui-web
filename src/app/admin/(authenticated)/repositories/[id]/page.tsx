'use client';

import { Suspense } from 'react';

import PageAdminRepository from '@/features/repositories/PageAdminRepository';

export default function Page() {
  return (
    <Suspense>
      <PageAdminRepository />
    </Suspense>
  );
}
