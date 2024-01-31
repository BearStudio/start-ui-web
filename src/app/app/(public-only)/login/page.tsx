'use client';

import { Suspense } from 'react';

import PageAppLogin from '@/features/auth/PageLogin';

export default function Page() {
  return (
    <Suspense>
      <PageAppLogin />
    </Suspense>
  );
}
