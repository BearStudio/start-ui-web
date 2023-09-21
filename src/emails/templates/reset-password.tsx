import { Container, Heading, Link, Text } from '@react-email/components';

import { Layout } from '@/emails/components/Layout';
import { styles } from '@/emails/styles';
import i18n from '@/lib/i18n/server';

type EmailResetPasswordProps = {
  language: string;
  resetLink?: string;
};

export const EmailResetPassword = ({
  language,
  resetLink,
}: EmailResetPasswordProps) => {
  return (
    <Layout
      language={language}
      preview={i18n.t('emails:resetPassword.preview')}
    >
      <Container style={styles.container}>
        <Heading style={styles.h1}>
          {i18n.t('emails:resetPassword.title')}
        </Heading>
        <Text style={styles.text}>
          <Link style={styles.link} href={resetLink} target="_blank">
            Click here to reset your password
          </Link>
        </Text>
        <Text style={styles.text}>
          Or, copy and paste this temporary login code:
        </Text>
        <code style={styles.code}>{resetLink}</code>
        <Text style={styles.text}>
          If you didn&apos;t try to login, you can safely ignore this email.
        </Text>
        <Text style={styles.text}>
          Hint: You can set a permanent password in Settings & members → My
          account.
        </Text>
        <Text style={styles.footer}>
          <Link style={styles.link} href="https://notion.so" target="_blank">
            Notion.so
          </Link>
          , the all-in-one-workspace
          <br />
          for your notes, tasks, wikis, and databases.
        </Text>
      </Container>
    </Layout>
  );
};

export default EmailResetPassword;
