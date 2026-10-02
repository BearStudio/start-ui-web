import { Img, Link, Section } from 'react-email';

import { emailAssetSrc } from '@/emails/utils';

export const EmailHeader = () => {
  return (
    <Section className="mb-5 w-fit px-2" align="left" data-skip-in-text="true">
      <Link href="https://start-ui.com" target="_blank">
        <Img
          src={emailAssetSrc('logo.png')}
          alt="Start UI"
          width={120}
          height={27}
        />
      </Link>
    </Section>
  );
};
