import React from 'react';

import { Box, Button, Heading, Stack } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { APP_PATH } from '@/features/app/constants';
import { LoginForm } from '@/features/auth/LoginForm';
import { RouterInput, RouterOutput } from '@/server/router';

export default function PageLogin() {
  const { t } = useTranslation(['auth']);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleOnSuccess = (
    data: RouterOutput['auth']['login'],
    variables: RouterInput['auth']['login']
  ) => {
    const urlSearchParams = new URLSearchParams(searchParams);
    urlSearchParams.set('email', variables.email);
    router.push(
      `${APP_PATH}/login/${data.token}?${urlSearchParams.toString()}`
    );
  };

  return (
    <Stack spacing={6}>
      <Heading size="md">{t('auth:login.title')}</Heading>
      <LoginForm onSuccess={handleOnSuccess} />

      <Button
        variant="link"
        as={Link}
        href={`${APP_PATH}/register`}
        whiteSpace="normal"
        display="inline"
        textAlign="center"
      >
        {t('auth:login.actions.needAccount')}{' '}
        <Box as="strong" ms="2" color="gray.600" _dark={{ color: 'gray.300' }}>
          {t('auth:login.actions.register')}
        </Box>
      </Button>
    </Stack>
  );
}
