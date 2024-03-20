'use client';

import { Suspense } from 'react';

import PageAdminLoginValidate from '@/features/auth/PageAdminLoginValidate';

export default function Page() {
  return (
    <Suspense>
      <PageAdminLoginValidate />
    </Suspense>
  );
}
