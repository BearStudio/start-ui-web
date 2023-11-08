import React from 'react';

import {
  Button,
  Divider,
  HStack,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { APP_PATH } from '@/features/app/constants';
import { LoginForm } from '@/features/auth/LoginForm';
import type { RouterInputs, RouterOutputs } from '@/lib/trpc/types';

export default function PageLogin() {
  const { t } = useTranslation(['auth', 'common']);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleOnSuccess = (
    data: RouterOutputs['auth']['login'],
    variables: RouterInputs['auth']['login']
  ) => {
    const urlSearchParams = new URLSearchParams(searchParams);
    urlSearchParams.set('email', variables.email);
    router.push(
      `${APP_PATH}/login/${data.token}?${urlSearchParams.toString()}`
    );
  };

  return (
    <Stack spacing={6}>
      <Stack spacing={1}>
        <Heading size="md">{t('auth:login.appTitle')}</Heading>
        <Text fontSize="sm" color="text-dimmed">
          {t('auth:login.appSubTitle')}
        </Text>
      </Stack>

      <Button
        variant="@primary"
        size="lg"
        as={Link}
        href={`${APP_PATH}/register`}
      >
        {t('auth:login.actions.register')}
      </Button>

      <HStack>
        <Divider flex={1} />
        <Text
          fontSize="xs"
          color="gray.400"
          fontWeight="bold"
          textTransform="uppercase"
        >
          {t('common:or')}
        </Text>
        <Divider flex={1} />
      </HStack>

      <LoginForm onSuccess={handleOnSuccess} buttonVariant="@secondary" />
    </Stack>
  );
}
