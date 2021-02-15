import React from 'react';

import { createIcon } from '@chakra-ui/react';

import { Icon } from './Icon';

const SvgIcon = createIcon({
  displayName: 'Example',
  viewBox: '0 0 24 24',
  path: (
    <>
      <path
        d="M9.273 2A7.273 7.273 0 002 9.273v5.454A7.273 7.273 0 009.273 22h5.454A7.273 7.273 0 0022 14.727V9.273A7.273 7.273 0 0014.727 2H9.273zm2.983 5.561a2.727 2.727 0 00-3.566 1.47l-1.129 2.713a2.727 2.727 0 001.47 3.566l2.713 1.129a2.727 2.727 0 003.566-1.47l1.129-2.713a2.727 2.727 0 00-1.47-3.566l-2.713-1.129z"
        fill="currentColor"
      />
    </>
  ),
});

export const IconExample = (props) => {
  return <Icon icon={SvgIcon} {...props} />;
};
