import { ReactNode } from 'react';
import { Body, Head, Html, Preview, Tailwind } from 'react-email';

import { AVAILABLE_LANGUAGES } from '@/lib/i18n/constants';

import { emailTailwindConfig } from '@/emails/tailwind.config';

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
      <Tailwind config={emailTailwindConfig}>
        <Head>
          <meta name="viewport" content="width=device-width" />
        </Head>
        <Preview>{preview}</Preview>
        <Body className="bg-white font-sans">{children}</Body>
      </Tailwind>
    </Html>
  );
};
