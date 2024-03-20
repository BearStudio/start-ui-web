'use client';

import { Suspense } from 'react';

import PageHome from '@/features/app-home/PageHome';

export default function Page() {
  return (
    <Suspense>
      <PageHome />
    </Suspense>
  );
}
