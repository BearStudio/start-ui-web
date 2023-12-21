'use client';

import { forwardRef } from '@chakra-ui/react';
import Link, { LinkProps } from 'next/link';

import { APP_PATH } from '@/features/app/constants';

export const LinkApp = forwardRef(
  (
    {
      href: _href,
      ...rest
    }: LinkProps &
      Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>,
    ref
  ) => {
    const href = `${APP_PATH}${_href}`;

    return <Link ref={ref} href={href} {...rest} />;
  }
);
