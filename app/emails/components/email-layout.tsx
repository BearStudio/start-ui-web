import { Body, Head, Html, Preview } from '@react-email/components';
import { ReactNode } from 'react';

import { AVAILABLE_LANGUAGES } from '@/lib/i18n/constants';

import { styles } from '@/emails/styles';

export const EmailLayout = ({
  preview,
  children,
  language,
}: {
  preview: string;
  children: ReactNode;
  language: string;
}) => {
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
