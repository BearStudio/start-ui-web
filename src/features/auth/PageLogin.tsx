import React from 'react';

import { Box, Button, Heading, Stack } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { LoginForm } from '@/features/auth/LoginForm';
import {
  OAuthLoginButtonsGrid,
  OAuthLoginDivider,
} from '@/features/auth/OAuthLogin';
import { ROUTES_AUTH } from '@/features/auth/routes';
import type { RouterInputs, RouterOutputs } from '@/lib/trpc/types';

export default function PageLogin() {
  const { t } = useTranslation(['auth', 'common']);
  const router = useRouter();

  const handleOnSuccess = (
    data: RouterOutputs['auth']['login'],
    variables: RouterInputs['auth']['login']
  ) => {
    router.push(
      ROUTES_AUTH.loginValidate({
        token: data.token,
        email: variables.email,
      })
    );
  };

  return (
    <Stack spacing={6}>
      <Stack spacing={1}>
        <Heading size="md">{t('auth:login.appTitle')}</Heading>
        <Button
          as={Link}
          href={ROUTES_AUTH.register()}
          variant="link"
          size="sm"
          whiteSpace="normal"
          display="inline"
          fontWeight="normal"
          px="0"
          color="text-dimmed"
        >
          {t('auth:login.actions.noAccount')}
          <Box
            as="strong"
            ms="1"
            color="brand.500"
            _dark={{ color: 'brand.300' }}
          >
            {t('auth:login.actions.register')}
          </Box>
        </Button>
      </Stack>

      <OAuthLoginButtonsGrid />
      <OAuthLoginDivider />

      <LoginForm onSuccess={handleOnSuccess} />
    </Stack>
  );
}
