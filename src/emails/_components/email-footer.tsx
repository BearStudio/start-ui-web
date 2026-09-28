import { Link, Section } from 'react-email';

export const EmailFooter = () => {
  return (
    <Section className="text-text-muted text-xs leading-[22px]">
      <Link
        className="text-primary underline underline-offset-4"
        href="https://start-ui.com"
        target="_blank"
      >
        <strong>Start UI</strong>
      </Link>
      <br />
      Opinionated UI starters
    </Section>
  );
};
