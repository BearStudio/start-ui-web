import React from 'react';

import { Box, Button, Center, Heading } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { Link as RouterLink } from 'react-router-dom';

import { LoginForm } from '@/app/auth/LoginForm';
import { useRedirectFromUrl } from '@/app/router';
import { Logo, SlideIn } from '@/components';

export const PageLogin = () => {
  const { t } = useTranslation();
  const redirect = useRedirectFromUrl();
  const queryCache = useQueryClient();
  const onLogin = () => {
    queryCache.clear();
    redirect();
  };
  return (
    <SlideIn>
      <Box px="2" py="4rem" w="22rem" maxW="full" m="auto">
        <Logo h="3rem" mb="8" mx="auto" />
        <Box
          p="6"
          borderRadius="md"
          boxShadow="md"
          bg="white"
          _dark={{ bg: 'blackAlpha.400' }}
        >
          <Heading size="md" mb="4" data-test="login-page-heading">
            {t('auth:login.title')}
          </Heading>
          <LoginForm onSuccess={onLogin} />
        </Box>
        <Center mt="8">
          <Button as={RouterLink} to="/account/register" variant="link">
            {t('auth:login.actions.needAccount')}{' '}
            <Box
              as="strong"
              ms="2"
              color="gray.600"
              _dark={{ color: 'gray.300' }}
            >
              {t('auth:login.actions.register')}
            </Box>
          </Button>
        </Center>
      </Box>
    </SlideIn>
  );
};
