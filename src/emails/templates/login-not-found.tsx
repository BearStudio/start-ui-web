import {
  Button,
  Container,
  Heading,
  Section,
  Text,
} from '@react-email/components';

import { Footer } from '@/emails/components/Footer';
import { Layout } from '@/emails/components/Layout';
import { styles } from '@/emails/styles';
import { env } from '@/env.mjs';
import i18n from '@/lib/i18n/server';

type EmailLoginNotFoundProps = {
  language: string;
};

export const EmailLoginNotFound = ({ language }: EmailLoginNotFoundProps) => {
  i18n.changeLanguage(language);
  return (
    <Layout preview={i18n.t('emails:loginNotFound.preview')}>
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
            href={`${env.NEXT_PUBLIC_BASE_URL}`}
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
