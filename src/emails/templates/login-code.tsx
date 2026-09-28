import { Container, Heading, Section, Text } from 'react-email';

import i18n from '@/lib/i18n';

import { EmailFooter } from '@/emails/_components/email-footer';
import { EmailLayout } from '@/emails/_components/email-layout';
import { AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES } from '@/features/auth/config';

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
      <Container className="mx-auto px-3 py-4">
        <Heading className="text-text my-2 p-0 text-2xl font-bold">
          {i18n.t('emails:loginCode.title')}
        </Heading>
        <Section className="my-4">
          <Text className="text-text my-2 text-base leading-normal">
            {i18n.t('emails:loginCode.intro')}
          </Text>
          <Text className="font-code my-2 inline-block rounded-[5px] bg-primary px-[18px] py-4 text-[32px] tracking-[2px] break-all text-white">
            {props.code}
          </Text>
          <Text className="text-text-muted my-2 text-sm leading-normal">
            {i18n.t('emails:loginCode.validityTime', {
              expiration: AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES,
            })}
            <br />
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
