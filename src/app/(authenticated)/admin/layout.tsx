'use client';

import { ReactNode } from 'react';

import { GuardAdmin } from '@/features/auth/GuardAdmin';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <GuardAdmin>{children}</GuardAdmin>;
}
