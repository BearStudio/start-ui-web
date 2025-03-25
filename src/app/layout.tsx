import { ReactNode } from 'react';

import { Metadata, Viewport } from 'next';

import { Document } from '@/app/Document';
import { NextLoader } from '@/app/NextLoader';
import { getEnvHintTitlePrefix } from '@/features/devtools/EnvHint';

export const metadata: Metadata = {
  title: {
    template: `${getEnvHintTitlePrefix()} %s`,
    default: `${getEnvHintTitlePrefix()} Start UI [web]`,
  },
  applicationName: 'Start UI [web]',
  description: 'Opinionated UI starter',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Document>
      <NextLoader />
      {children}
    </Document>
  );
}
