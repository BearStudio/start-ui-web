import React from 'react';

import { Center, Spinner } from '@chakra-ui/react';

export const Loader = () => {
  return (
    <Center flex="1">
      <Spinner />
    </Center>
  );
};
