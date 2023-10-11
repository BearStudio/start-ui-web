'use client';

import { ReactNode } from 'react';

import { useUpdateAccountLanguage } from '@/features/account/useUpdateAccountLanguage';
import { AdminLayout } from '@/features/admin/AdminLayout';
import { GuardAdminAuthenticated } from '@/features/auth/GuardAdminAuthenticated';

export default function AutenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  useUpdateAccountLanguage();
  return (
    <GuardAdminAuthenticated>
      <AdminLayout>{children}</AdminLayout>
    </GuardAdminAuthenticated>
  );
}
