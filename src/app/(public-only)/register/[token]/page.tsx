'use client';

import { Suspense } from 'react';

import PageRegisterValidate from '@/features/auth/PageRegisterValidate';

export default function Page() {
  return (
    <Suspense>
      <PageRegisterValidate />
    </Suspense>
  );
}
