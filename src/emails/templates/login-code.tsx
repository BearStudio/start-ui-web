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

type EmailLoginCodeProps = {
  language: string;
  code: string;
};

export const EmailLoginCode = ({ language, code }: EmailLoginCodeProps) => {
  i18n.changeLanguage(language);
  return (
    <Layout preview="TODO">
      <Container style={styles.container}>
        <Heading style={styles.h1}>{code}</Heading>
        <Section style={styles.section}>
          <Text style={styles.text}>
            "TODO"
            <br />
            "TODO"
            <br />
          </Text>
          <Button pY={12} pX={20} style={styles.button} target="_blank">
            "TODO"
          </Button>
        </Section>
        <Section style={styles.section}>
          <Text style={styles.text}>"TODO"</Text>
          <Text style={styles.text}>"TODO" email.</Text>
        </Section>
        <Footer />
      </Container>
    </Layout>
  );
};

export default EmailLoginCode;
