import React from 'react';

import { SlideFade } from '@chakra-ui/react';

export const SlideIn = ({ children, ...rest }) => {
  return (
    <SlideFade
      in
      offsetY={-20}
      style={{ display: 'flex', flex: 1, flexDirection: 'column' }}
      {...rest}
    >
      {children}
    </SlideFade>
  );
};
