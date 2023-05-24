'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { Loader } from '@/layout/Loader';

export default function PageRoot() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/app');
  }, [router]);

  return <Loader />;
}
