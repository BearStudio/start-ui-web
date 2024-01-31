'use client';

import { Suspense } from 'react';

import { ErrorPage } from '@/components/ErrorPage';

export default function GlobalError() {
  return (
    <Suspense>
      <ErrorPage />
    </Suspense>
  );
}
