'use client';

import { ReactNode } from 'react';

import { GuardAdminAuthenticated } from '@/features/auth/GuardAdminAuthenticated';

export default function ManagementLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <GuardAdminAuthenticated>{children}</GuardAdminAuthenticated>;
}
