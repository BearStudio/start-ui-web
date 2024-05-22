import { Container, Heading, Section, Text } from '@react-email/components';

import { Footer } from '@/emails/components/Footer';
import { Layout } from '@/emails/components/Layout';
import { styles } from '@/emails/styles';
import { VALIDATION_TOKEN_EXPIRATION_IN_MINUTES } from '@/features/auth/utils';
import i18n from '@/lib/i18n/server';

type EmailDeleteAccountCodeProps = {
  language: string;
  name: string;
  code: string;
};

export const EmailDeleteAccountCode = ({
  language,
  name,
  code,
}: EmailDeleteAccountCodeProps) => {
  i18n.changeLanguage(language);
  return (
    <Layout preview={i18n.t('emails:deleteAccountCode.preview')}>
      <Container style={styles.container}>
        <Heading style={styles.h1}>
          {i18n.t('emails:deleteAccountCode.title')}
        </Heading>
        <Section style={styles.section}>
          <Text style={styles.text}>
            {i18n.t('emails:deleteAccountCode.hello', { name: name ?? '' })}
            <br />
            {i18n.t('emails:deleteAccountCode.intro')}
          </Text>
          <Text style={styles.code}>{code}</Text>
          <Text style={styles.textMuted}>
            {i18n.t('emails:deleteAccountCode.validityTime', {
              expiration: VALIDATION_TOKEN_EXPIRATION_IN_MINUTES,
            })}
            <br />
            {i18n.t('emails:deleteAccountCode.ignoreHelper')}
          </Text>
        </Section>
        <Footer />
      </Container>
    </Layout>
  );
};

export default EmailDeleteAccountCode;
