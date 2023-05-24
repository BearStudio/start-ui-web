import { ReactNode } from 'react';

import { Document } from '@/app/Document';

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <Document>{children}</Document>;
}
