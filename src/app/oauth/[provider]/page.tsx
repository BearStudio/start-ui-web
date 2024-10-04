'use client';

import { Suspense } from 'react';

import PageOAuthCallback from '@/features/auth/PageOAuthCallback';

export default function Page() {
  return (
    <Suspense>
      <PageOAuthCallback />
    </Suspense>
  );
}
