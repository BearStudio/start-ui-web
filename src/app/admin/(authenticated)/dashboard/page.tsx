'use client';

import { Suspense } from 'react';

import PageAdminDashboard from '@/features/admin-dashboard/PageAdminDashboard';

export default function Page() {
  return (
    <Suspense>
      <PageAdminDashboard />
    </Suspense>
  );
}
