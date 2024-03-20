'use client';

import { Suspense } from 'react';

import PageAccount from '@/features/account/PageAccount';

export default function Page() {
  return (
    <Suspense>
      <PageAccount />
    </Suspense>
  );
}
