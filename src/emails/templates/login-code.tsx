import { Container, Heading, Section, Text } from 'react-email';

import i18n from '@/lib/i18n';

import { EmailFooter } from '@/emails/_components/email-footer';
import { EmailHeader } from '@/emails/_components/email-header';
import { EmailLayout } from '@/emails/_components/email-layout';
import { AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES } from '@/features/auth/otp';

export const TemplateLoginCode = (props: {
  language: string;
  code: string;
}) => {
  i18n.changeLanguage(props.language);

  return (
    <EmailLayout
      preview={i18n.t('emails:loginCode.preview')}
      language={props.language}
    >
      <Container className="mx-auto max-w-120 px-4 py-10">
        <EmailHeader />
        <Section className="px-2 py-4">
          <Heading className="text-text mt-0 mb-2 p-0 text-[22px] leading-7 font-semibold tracking-[-0.02em]">
            {i18n.t('emails:loginCode.title')}
          </Heading>
          <Text className="text-text mt-0 mb-6 text-[15px] leading-6">
            {i18n.t('emails:loginCode.intro')}
          </Text>

          <Text className="font-code bg-surface text-text m-0 mb-6 rounded-[10px] border border-solid border-border px-6 py-4 text-center text-[26px] leading-8 font-semibold tracking-[0.2em] select-all">
            {props.code}
          </Text>

          <Text className="text-text-muted mt-0 mb-2 text-[13px] leading-5">
            {i18n.t('emails:loginCode.validityTime', {
              expiration: AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES,
            })}
          </Text>
          <Text className="text-text-muted m-0 text-[13px] leading-5">
            {i18n.t('emails:loginCode.ignoreHelper')}
          </Text>
        </Section>

        <EmailFooter />
      </Container>
    </EmailLayout>
  );
};

TemplateLoginCode.PreviewProps = {
  language: 'en',
  code: '482913',
};

export default TemplateLoginCode;
