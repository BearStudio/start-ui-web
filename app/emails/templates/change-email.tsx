import { Container, Heading, Section, Text } from '@react-email/components';

import { AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES } from '@/lib/auth/config';
import i18n from '@/lib/i18n';

import { EmailFooter } from '@/emails/components/email-footer';
import { EmailLayout } from '@/emails/components/email-layout';
import { styles } from '@/emails/styles';

export const TemplateChangeEmail = (props: {
  language: string;
  code: string;
}) => {
  i18n.changeLanguage(props.language);
  return (
    <EmailLayout
      preview={i18n.t('emails:changeEmail.preview')}
      language={props.language}
    >
      <Container style={styles.container}>
        <Heading style={styles.h1}>
          {i18n.t('emails:changeEmail.title')}
        </Heading>
        <Section style={styles.section}>
          <Text style={styles.text}>{i18n.t('emails:changeEmail.intro')}</Text>
          <Text style={styles.code}>{props.code}</Text>
          <Text style={styles.textMuted}>
            {i18n.t('emails:changeEmail.validityTime', {
              expiration: AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES,
            })}
            <br />
            {i18n.t('emails:changeEmail.ignoreHelper')}
          </Text>
        </Section>
        <EmailFooter />
      </Container>
    </EmailLayout>
  );
};

export default TemplateChangeEmail;
