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
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { LoginForm } from '@/features/auth/LoginForm';
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
      ROUTES_AUTH.app.loginValidate({
        token: data.token,
        email: variables.email,
      })
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
        href={ROUTES_AUTH.app.register()}
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
