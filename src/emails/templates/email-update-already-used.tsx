import { Container, Heading, Section, Text } from '@react-email/components';

import { Footer } from '@/emails/components/Footer';
import { Layout } from '@/emails/components/Layout';
import { styles } from '@/emails/styles';
import i18n from '@/lib/i18n/server';

type EmailUpdateAlreadyUsedProps = {
  language: string;
  name: string;
  email: string;
};

export const EmailUpdateAlreadyUsed = ({
  language,
  name,
  email,
}: EmailUpdateAlreadyUsedProps) => {
  i18n.changeLanguage(language);
  return (
    <Layout
      preview={i18n.t('emails:emailUpdateAlreadyUsed.preview')}
      language={language}
    >
      <Container style={styles.container}>
        <Heading style={styles.h1}>
          {i18n.t('emails:emailUpdateAlreadyUsed.title')}
        </Heading>
        <Section style={styles.section}>
          <Text style={styles.text}>
            {i18n.t('emails:emailUpdateAlreadyUsed.hello', {
              name,
            })}
            <br />
            {i18n.t('emails:emailUpdateAlreadyUsed.intro', { email })}
          </Text>
          <Text style={styles.textMuted}>
            {i18n.t('emails:emailUpdateAlreadyUsed.ignoreHelper')}
          </Text>
        </Section>
        <Footer />
      </Container>
    </Layout>
  );
};

export default EmailUpdateAlreadyUsed;
