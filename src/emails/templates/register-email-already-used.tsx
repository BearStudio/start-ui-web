import { Container, Heading, Section, Text } from '@react-email/components';

import { Footer } from '@/emails/components/Footer';
import { Layout } from '@/emails/components/Layout';
import { styles } from '@/emails/styles';
import i18n from '@/lib/i18n/server';

type RegisterEmailAlreadyUsedProps = {
  language: string;
  name: string;
  email: string;
};

export const RegisterEmailAlreadyUsed = ({
  language,
  name,
  email,
}: RegisterEmailAlreadyUsedProps) => {
  i18n.changeLanguage(language);
  return (
    <Layout
      preview={i18n.t('emails:registerEmailAlreadyUsed.preview')}
      language={language}
    >
      <Container style={styles.container}>
        <Heading style={styles.h1}>
          {i18n.t('emails:registerEmailAlreadyUsed.title')}
        </Heading>
        <Section style={styles.section}>
          <Text style={styles.text}>
            {i18n.t('emails:registerEmailAlreadyUsed.hello', {
              name,
            })}
            <br />
            {i18n.t('emails:registerEmailAlreadyUsed.intro', { email })}
          </Text>
          <Text style={styles.textMuted}>
            {i18n.t('emails:registerEmailAlreadyUsed.ignoreHelper')}
          </Text>
        </Section>
        <Footer />
      </Container>
    </Layout>
  );
};

export default RegisterEmailAlreadyUsed;
