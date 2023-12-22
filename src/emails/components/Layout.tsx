import { ReactNode } from 'react';

import { Body, Head, Html, Preview } from '@react-email/components';

import { styles } from '@/emails/styles';

interface LayoutProps {
  preview: string;
  children: ReactNode;
}

export const Layout = ({ preview, children }: LayoutProps) => {
  return (
    <Html>
      <Head>
        <meta name="viewport" content="width=device-width" />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={styles.main}>{children}</Body>
    </Html>
  );
};
