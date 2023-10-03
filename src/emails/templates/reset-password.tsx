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

type EmailResetPasswordProps = {
  language: string;
  name?: string;
  link: string;
};

export const EmailResetPassword = ({
  language,
  name,
  link,
}: EmailResetPasswordProps) => {
  i18n.changeLanguage(language);
  return (
    <Layout preview={i18n.t('emails:resetPassword.preview')}>
      <Container style={styles.container}>
        <Heading style={styles.h1}>
          {i18n.t('emails:resetPassword.title')}
        </Heading>
        <Section style={styles.section}>
          <Text style={styles.text}>
            {i18n.t('emails:resetPassword.hello', { name: name ?? '' })}
            <br />
            {i18n.t('emails:resetPassword.intro')}
            <br />
          </Text>
          <Button
            pY={11}
            pX={23}
            style={styles.button}
            href={link}
            target="_blank"
          >
            {i18n.t('emails:resetPassword.link')}
          </Button>
        </Section>
        <Section style={styles.section}>
          <Text style={styles.text}>
            {i18n.t('emails:resetPassword.copyPastHelper')}
          </Text>
          <code style={styles.code}>{link}</code>
          <Text style={styles.text}>
            {i18n.t('emails:resetPassword.ignoreHelper')}
          </Text>
        </Section>
        <Footer />
      </Container>
    </Layout>
  );
};

export default EmailResetPassword;
