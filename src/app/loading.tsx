'use client';

import { Center, Spinner } from '@chakra-ui/react';

export default function RootLoading() {
  return (
    <Center flex="1">
      <Spinner />
    </Center>
  );
}
