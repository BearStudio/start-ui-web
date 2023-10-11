'use client';

import { ReactNode } from 'react';

import { useUpdateAccountLanguage } from '@/features/account/useUpdateAccountLanguage';
import { GuardAuthenticated } from '@/features/auth/GuardAuthenticated';
import { Layout } from '@/features/layout/Layout';

export default function AutenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  useUpdateAccountLanguage();
  return (
    <GuardAuthenticated>
      <Layout>{children}</Layout>
    </GuardAuthenticated>
  );
}
