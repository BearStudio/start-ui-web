import { Column, Hr, Img, Link, Row, Section } from 'react-email';

import { emailAssetSrc } from '@/emails/utils';

export const EmailFooter = () => {
  return (
    <Section className="text-text-muted px-2 pt-7 text-xs leading-5">
      <Hr className="m-0 mb-5 border-solid border-border" />
      <Row>
        <Column className="align-middle">
          <Link
            className="text-text font-semibold no-underline"
            href="https://start-ui.com"
            target="_blank"
          >
            Start UI
          </Link>
          <br />
          Opinionated UI starters
        </Column>
        <Column align="right" className="align-middle">
          <Img
            src={emailAssetSrc('mascot.png')}
            alt=""
            width={36}
            height={48}
            className="ml-auto block"
          />
        </Column>
      </Row>
    </Section>
  );
};
