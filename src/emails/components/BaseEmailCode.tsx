import { Container, Heading, Section, Text } from '@react-email/components';

import { Footer } from '@/emails/components/Footer';
import { Layout } from '@/emails/components/Layout';
import { styles } from '@/emails/styles';
import { VALIDATION_TOKEN_EXPIRATION_IN_MINUTES } from '@/features/auth/utils';
import i18n from '@/lib/i18n/server';

export type EmailCodeProps = {
  language: string;
  name: string;
  code: string;
};

type BaseEmailCodeProps = EmailCodeProps & {
  type:
    | 'deleteAccountCode'
    | 'loginCode'
    | 'registerCode'
    | 'emailAddressChange';
};

export const BaseEmailCode = ({
  language,
  name,
  code,
  type,
}: BaseEmailCodeProps) => {
  i18n.changeLanguage(language);
  return (
    <Layout preview={i18n.t(`emails:${type}.preview`)}>
      <Container style={styles.container}>
        <Heading style={styles.h1}>{i18n.t(`emails:${type}.title`)}</Heading>
        <Section style={styles.section}>
          <Text style={styles.text}>
            {i18n.t(`emails:${type}.hello`, { name: name ?? '' })}
            <br />
            {i18n.t(`emails:${type}.intro`)}
          </Text>
          <Text style={styles.code}>{code}</Text>
          <Text style={styles.textMuted}>
            {i18n.t(`emails:${type}.validityTime`, {
              expiration: VALIDATION_TOKEN_EXPIRATION_IN_MINUTES,
            })}
            <br />
            {i18n.t(`emails:${type}.ignoreHelper`)}
          </Text>
        </Section>
        <Footer />
      </Container>
    </Layout>
  );
};
