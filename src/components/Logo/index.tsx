import React from 'react';

import { chakra } from '@chakra-ui/react';

export const Logo = (props) => (
  <chakra.svg h="1.6rem" viewBox="0 0 44 6" {...props}>
    <rect width={44} height={6} rx={3} fill="currentColor" />
  </chakra.svg>
);
