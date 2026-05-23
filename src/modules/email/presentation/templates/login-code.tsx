import { Container, Heading, Section, Text } from 'react-email';

import i18n from '@/platform/lib/i18n';

import { AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES } from '@/modules/auth';
import { EmailFooter } from '@/modules/email/presentation/components/email-footer';
import { EmailLayout } from '@/modules/email/presentation/components/email-layout';
import { styles } from '@/modules/email/presentation/styles';

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
      <Container style={styles.container}>
        <Heading style={styles.h1}>{i18n.t('emails:loginCode.title')}</Heading>
        <Section style={styles.section}>
          <Text style={styles.text}>{i18n.t('emails:loginCode.intro')}</Text>
          <Text style={styles.code}>{props.code}</Text>
          <Text style={styles.textMuted}>
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

export default TemplateLoginCode;
