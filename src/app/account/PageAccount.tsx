import React from 'react';
import { Box, Heading } from '@chakra-ui/core';
import { useAccount } from '@/app/account/service';

export const PageAccount = () => {
  const { account } = useAccount();
  return (
    <Box>
      <Heading>Account</Heading>
      <pre>{JSON.stringify(account, null, 2)}</pre>
    </Box>
  );
};
