import { ReactNode } from 'react';

import { NextLoader } from '@/app/NextLoader';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <NextLoader lightColor="white" darkColor="white" />
      {children}
    </>
  );
}
