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
  const t = i18n.getFixedT(props.language, 'emails');

  return (
    <EmailLayout preview={t('loginCode.preview')} language={props.language}>
      <Container style={styles.container}>
        <Heading style={styles.h1}>{t('loginCode.title')}</Heading>
        <Section style={styles.section}>
          <Text style={styles.text}>{t('loginCode.intro')}</Text>
          <Text style={styles.code}>{props.code}</Text>
          <Text style={styles.textMuted}>
            {t('loginCode.validityTime', {
              expiration: AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES,
            })}
            <br />
            {t('loginCode.ignoreHelper')}
          </Text>
        </Section>
        <EmailFooter />
      </Container>
    </EmailLayout>
  );
};

export default TemplateLoginCode;
