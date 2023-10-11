import React from 'react';

import { Center, Spinner } from '@chakra-ui/react';

export const LoaderFull = () => {
  return (
    <Center flex="1">
      <Spinner />
    </Center>
  );
};
