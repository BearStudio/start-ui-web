import { ReactNode } from 'react';

import { getServerSession } from 'next-auth';

import { Document } from '@/app/Document';
import { authOptions } from '@/server/auth';

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);
  return <Document session={session}>{children}</Document>;
}
