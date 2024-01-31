'use client';

import { Suspense } from 'react';

import dynamic from 'next/dynamic';

import { LoaderFull } from '@/components/LoaderFull';

const PageApiDocumentation = dynamic(
  () => import('@/features/docs/PageApiDocumentation'),
  {
    loading: () => <LoaderFull />,
  }
);

export default function Page() {
  return (
    <Suspense>
      <PageApiDocumentation />
    </Suspense>
  );
}
