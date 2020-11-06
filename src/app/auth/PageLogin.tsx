import React from 'react';
import { LoginForm } from '@/app/auth/LoginForm';
import { Box, Heading } from '@chakra-ui/core';
import { useRedirectFromUrl } from '@/app/router';
import { useQueryCache } from 'react-query';

export const PageLogin = () => {
  const redirect = useRedirectFromUrl();
  const queryCache = useQueryCache();
  const onLogin = () => {
    queryCache.clear();
    redirect();
  };
  return (
    <Box p="6" pb="4rem" w="20rem" maxW="full" m="auto">
      <Heading my="4">Login</Heading>
      <LoginForm onSuccess={onLogin} />
    </Box>
  );
};
