'use client';

import { ReactNode } from 'react';

import { GuardPublicOnly } from '@/features/auth/GuardPublicOnly';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <GuardPublicOnly>{children}</GuardPublicOnly>;
}
