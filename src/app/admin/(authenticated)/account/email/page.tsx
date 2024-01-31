'use client';

import { Suspense } from 'react';

import PageAdminEmail from '@/features/account/PageAdminEmail';

export default function Page() {
  return (
    <Suspense>
      <PageAdminEmail />
    </Suspense>
  );
}
