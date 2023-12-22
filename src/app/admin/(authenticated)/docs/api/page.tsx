'use client';

import dynamic from 'next/dynamic';

import { LoaderFull } from '@/components/LoaderFull';

const PageApiDocumentation = dynamic(
  () => import('@/features/docs/PageApiDocumentation'),
  {
    loading: () => <LoaderFull />,
  }
);

export default function Page() {
  return <PageApiDocumentation />;
}
