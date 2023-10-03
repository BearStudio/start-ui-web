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
import i18n from '@/lib/i18n/server';

type EmailActivateAccountProps = {
  language: string;
  name?: string;
  link: string;
};

export const EmailActivateAccount = ({
  language,
  name,
  link,
}: EmailActivateAccountProps) => {
  i18n.changeLanguage(language);
  return (
    <Layout preview={i18n.t('emails:activateAccount.preview')}>
      <Container style={styles.container}>
        <Heading style={styles.h1}>
          {i18n.t('emails:activateAccount.title')}
        </Heading>
        <Section style={styles.section}>
          <Text style={styles.text}>
            {i18n.t('emails:activateAccount.hello', { name: name ?? '' })}
            <br />
            {i18n.t('emails:activateAccount.intro')}
            <br />
          </Text>
          <Button
            pY={12}
            pX={20}
            style={styles.button}
            href={link}
            target="_blank"
          >
            {i18n.t('emails:activateAccount.link')}
          </Button>
        </Section>
        <Section style={styles.section}>
          <Text style={styles.text}>
            {i18n.t('emails:activateAccount.copyPastHelper')}
          </Text>
          <code style={styles.code}>{link}</code>
          <Text style={styles.text}>
            {i18n.t('emails:activateAccount.ignoreHelper')}
            email.
          </Text>
        </Section>
        <Footer />
      </Container>
    </Layout>
  );
};

export default EmailActivateAccount;
