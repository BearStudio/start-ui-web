'use client';

import { Suspense } from 'react';

import { ErrorPage } from '@/components/ErrorPage';

export default function PageNotFound() {
  return (
    <Suspense>
      <ErrorPage errorCode={404} />
    </Suspense>
  );
}
