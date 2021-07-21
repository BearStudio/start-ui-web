import React from 'react';

import { Box, Button, Center, Heading } from '@chakra-ui/react';
import { useQueryClient } from 'react-query';
import { Link as RouterLink } from 'react-router-dom';

import { LoginForm } from '@/app/auth/LoginForm';
import { useRedirectFromUrl } from '@/app/router';
import { SlideIn } from '@/components';
import { useDarkMode } from '@/hooks/useDarkMode';

export const PageLogin = () => {
  const { colorModeValue } = useDarkMode();
  const redirect = useRedirectFromUrl();
  const queryCache = useQueryClient();
  const onLogin = () => {
    queryCache.clear();
    redirect();
  };
  return (
    <SlideIn>
      <Box p="2" pb="4rem" w="20rem" maxW="full" m="auto">
        <Box
          p="6"
          bg={colorModeValue('white', 'blackAlpha.400')}
          borderRadius="md"
          boxShadow="md"
        >
          <Heading size="lg" mb="4">
            Log In
          </Heading>
          <LoginForm onSuccess={onLogin} />
        </Box>
        <Center mt="8">
          <Button as={RouterLink} to="/account/register" variant="link">
            Need an account?{' '}
            <Box
              as="strong"
              color={colorModeValue('brand.500', 'brand.300')}
              ml="2"
            >
              Register now!
            </Box>
          </Button>
        </Center>
      </Box>
    </SlideIn>
  );
};
