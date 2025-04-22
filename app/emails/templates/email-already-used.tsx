import { Container, Heading, Section, Text } from '@react-email/components';

import i18n from '@/lib/i18n';

import { EmailFooter } from '@/emails/components/email-footer';
import { EmailLayout } from '@/emails/components/email-layout';
import { styles } from '@/emails/styles';

export const TemplateEmailAlreadyUsed = (props: {
  language: string;
  email: string;
}) => {
  i18n.changeLanguage(props.language);
  return (
    <EmailLayout
      preview={i18n.t('emails:emailAlreadyUsed.preview')}
      language={props.language}
    >
      <Container style={styles.container}>
        <Heading style={styles.h1}>
          {i18n.t('emails:emailAlreadyUsed.title')}
        </Heading>
        <Section style={styles.section}>
          <Text style={styles.text}>
            {i18n.t('emails:emailAlreadyUsed.content', { email: props.email })}
          </Text>
          <Text style={styles.textMuted}>
            {i18n.t('emails:emailAlreadyUsed.ignoreHelper')}
          </Text>
        </Section>
        <EmailFooter />
      </Container>
    </EmailLayout>
  );
};

export default TemplateEmailAlreadyUsed;
