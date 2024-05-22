import { Container, Heading, Section, Text } from '@react-email/components';

import { Footer } from '@/emails/components/Footer';
import { Layout } from '@/emails/components/Layout';
import { styles } from '@/emails/styles';
import { VALIDATION_TOKEN_EXPIRATION_IN_MINUTES } from '@/features/auth/utils';
import i18n from '@/lib/i18n/server';

type EmailLoginCodeProps = {
  language: string;
  name: string;
  code: string;
};

export const EmailLoginCode = ({
  language,
  name,
  code,
}: EmailLoginCodeProps) => {
  i18n.changeLanguage(language);
  return (
    <Layout preview={i18n.t('emails:loginCode.preview')}>
      <Container style={styles.container}>
        <Heading style={styles.h1}>{i18n.t('emails:loginCode.title')}</Heading>
        <Section style={styles.section}>
          <Text style={styles.text}>
            {i18n.t('emails:loginCode.hello', { name: name ?? '' })}
            <br />
            {i18n.t('emails:loginCode.intro')}
          </Text>
          <Text style={styles.code}>{code}</Text>
          <Text style={styles.textMuted}>
            {i18n.t('emails:loginCode.validityTime', {
              expiration: VALIDATION_TOKEN_EXPIRATION_IN_MINUTES,
            })}
            <br />
            {i18n.t('emails:loginCode.ignoreHelper')}
          </Text>
        </Section>
        <Footer />
      </Container>
    </Layout>
  );
};

export default EmailLoginCode;
