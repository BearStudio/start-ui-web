import { Hr, Link, Section } from 'react-email';

export const EmailFooter = () => {
  return (
    <Section className="text-text-muted px-2 pt-7 text-xs leading-5">
      <Hr className="m-0 mb-5 border-solid border-border" />
      <Link
        className="text-text font-semibold no-underline"
        href="https://start-ui.com"
        target="_blank"
      >
        Start UI
      </Link>
      <br />
      Opinionated UI starters
    </Section>
  );
};
