import { Link, Section } from '@react-email/components';

import { styles } from '@/emails/styles';

export const EmailFooter = () => {
  return (
    <Section style={styles.footer}>
      <Link style={styles.link} href="https://start-ui.com" target="_blank">
        <strong>Start UI</strong>
      </Link>
      <br />
      Opinionated UI starters
    </Section>
  );
};
