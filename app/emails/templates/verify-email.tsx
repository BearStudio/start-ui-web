import { Container, Heading, Section, Text } from '@react-email/components';

import i18n from '@/lib/i18n';

import { EmailFooter } from '@/emails/components/email-footer';
import { EmailLayout } from '@/emails/components/email-layout';
import { styles } from '@/emails/styles';

export const TemplateVerifyEmail = (props: {
  language: string;
  url: string;
}) => {
  i18n.changeLanguage(props.language);
  return (
    <EmailLayout
      preview={i18n.t('emails:verifyEmail.preview')}
      language={props.language}
    >
      <Container style={styles.container}>
        <Heading style={styles.h1}>
          {i18n.t('emails:verifyEmail.title')}
        </Heading>
        <Section style={styles.section}>
          <Text style={styles.text}>{i18n.t('emails:verifyEmail.intro')}</Text>
          <Text>
            {props.url} {/* TODO style link */}
          </Text>
          <Text style={styles.textMuted}>
            {i18n.t('emails:verifyEmail.ignoreHelper')}
          </Text>
        </Section>
        <EmailFooter />
      </Container>
    </EmailLayout>
  );
};

export default TemplateVerifyEmail;
