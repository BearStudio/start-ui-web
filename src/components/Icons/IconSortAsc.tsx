import React from 'react';

import { createIcon } from '@chakra-ui/react';

import { Icon, IconProps } from './Icon';

const SvgIcon = createIcon({
  displayName: 'SortAsc',
  viewBox: '0 0 24 24',
  path: (
    <>
      <path
        d="M6.226 11c-1.051 0-1.613-1.268-.92-2.077l5.405-6.324a1.687 1.687 0 012.578 0l5.406 6.324c.692.81.13 2.077-.921 2.077H6.226z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.13 15H7.87L12 19.831 16.13 15zm-2.84 6.401a1.687 1.687 0 01-2.58 0l-5.405-6.324c-.692-.81-.13-2.077.921-2.077h11.548c1.051 0 1.613 1.268.92 2.077l-5.405 6.324z"
        fill="currentColor"
      />
    </>
  ),
});

export const IconSortAsc = (props: Omit<IconProps, 'icon'>) => {
  return <Icon icon={SvgIcon} {...props} />;
};
