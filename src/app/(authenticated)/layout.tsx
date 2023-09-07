'use client';

import { ReactNode } from 'react';

import { GuardAuthenticated } from '@/features/auth/GuardAuthenticated';
import { Layout } from '@/layout/Layout';

export default function AutenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <GuardAuthenticated>
      <Layout>{children}</Layout>
    </GuardAuthenticated>
  );
}
