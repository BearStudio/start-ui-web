import { ReactNode } from 'react';

import { Body, Head, Html, Preview } from '@react-email/components';

import { styles } from '@/emails/styles';
import { AVAILABLE_LANGUAGES } from '@/lib/i18n/constants';

interface LayoutProps {
  preview: string;
  children: ReactNode;
  language: string;
}

export const Layout = ({ preview, children, language }: LayoutProps) => {
  return (
    <Html
      lang={language}
      dir={
        AVAILABLE_LANGUAGES.find(({ key }) => key === language)?.dir ?? 'ltr'
      }
    >
      <Head>
        <meta name="viewport" content="width=device-width" />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={styles.main}>{children}</Body>
    </Html>
  );
};
