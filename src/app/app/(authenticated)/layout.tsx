'use client';

import { ReactNode } from 'react';

import { useUpdateAccountLanguage } from '@/features/account/useUpdateAccountLanguage';
import { AppLayout } from '@/features/app/AppLayout';
import { GuardAuthenticated } from '@/features/auth/GuardAuthenticated';

export default function AutenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  useUpdateAccountLanguage();
  return (
    <GuardAuthenticated>
      <AppLayout>{children}</AppLayout>
    </GuardAuthenticated>
  );
}
