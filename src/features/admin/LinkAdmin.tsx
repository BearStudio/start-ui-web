'use client';

import { forwardRef } from '@chakra-ui/react';
import Link, { LinkProps } from 'next/link';

import { ADMIN_PATH } from '@/features/admin/constants';

export const LinkAdmin = forwardRef(
  (
    {
      href: _href,
      ...rest
    }: LinkProps &
      Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>,
    ref
  ) => {
    const href = `${ADMIN_PATH}${_href}`;

    return <Link ref={ref} href={href} {...rest} />;
  }
);
