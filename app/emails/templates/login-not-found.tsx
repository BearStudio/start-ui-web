import {
  Button,
  Container,
  Heading,
  Section,
  Text,
} from '@react-email/components';

import i18n from '@/lib/i18n';

import { Footer } from '@/emails/components/Footer';
import { Layout } from '@/emails/components/Layout';
import { styles } from '@/emails/styles';
import { envClient } from '@/env/client';

type EmailLoginNotFoundProps = {
  language: string;
};

export const EmailLoginNotFound = ({ language }: EmailLoginNotFoundProps) => {
  i18n.changeLanguage(language);
  return (
    <Layout
      preview={i18n.t('emails:loginNotFound.preview')}
      language={language}
    >
      <Container style={styles.container}>
        <Heading style={styles.h1}>
          {i18n.t('emails:loginNotFound.title')}
        </Heading>
        <Section style={styles.section}>
          <Text style={styles.text}>
            {i18n.t('emails:loginNotFound.intro')}
          </Text>
          <Button
            style={styles.button}
            href={`${envClient.VITE_BASE_URL}`}
            target="_blank"
          >
            {i18n.t('emails:loginNotFound.button')}
          </Button>
          <Text style={styles.textMuted}>
            {i18n.t('emails:loginNotFound.ignoreHelper')}
          </Text>
        </Section>
        <Footer />
      </Container>
    </Layout>
  );
};

export default EmailLoginNotFound;
