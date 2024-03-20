'use client';

import { Suspense } from 'react';

import PageLoginValidate from '@/features/auth/PageLoginValidate';

export default function Page() {
  return (
    <Suspense>
      <PageLoginValidate />
    </Suspense>
  );
}
