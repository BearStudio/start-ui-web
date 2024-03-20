import { ReactNode, Suspense } from 'react';

import { Metadata } from 'next';

import { Document } from '@/app/Document';
import { NextLoader } from '@/app/NextLoader';

export const metadata: Metadata = {
  title: 'Start UI [web]',
  applicationName: 'Start UI [web]',
  description: 'Opinionated UI starter',
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Document>
      <Suspense>
        <NextLoader />
        {children}
      </Suspense>
    </Document>
  );
}
