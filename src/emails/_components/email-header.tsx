import { Link, Section } from 'react-email';

export const EmailHeader = () => {
  return (
    <Section className="mb-5 px-2">
      <Link
        href="https://start-ui.com"
        target="_blank"
        className="text-text text-[15px] font-semibold tracking-[-0.02em] no-underline"
      >
        Start UI
      </Link>
    </Section>
  );
};
