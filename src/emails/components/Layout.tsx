import { ReactNode } from 'react';

import { Body, Head, Html, Preview } from '@react-email/components';

import { styles } from '@/emails/styles';
import i18n from '@/lib/i18n/server';

interface LayoutProps {
  language: string;
  preview: string;
  children: ReactNode;
}

export const Layout = ({ language, preview, children }: LayoutProps) => {
  i18n.changeLanguage(language);
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
