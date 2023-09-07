import React from 'react';

import { Box, HStack, Spinner, Text } from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useToastError, useToastSuccess } from '@/components/Toast';
import { useActivateAccount } from '@/features/account/api.client';

export default function PageActivate() {
  const { t } = useTranslation(['account']);
  const router = useRouter();
  const searchParams = useSearchParams();
  const key = searchParams?.get('key')?.toString();
  const activateAccount = useActivateAccount(key ?? '');

  const toastError = useToastError();
  const toastSuccess = useToastSuccess();

  if (activateAccount.isLoading) {
    return (
      <Box p="4" maxW="20rem" m="auto">
        <HStack>
          <Spinner size="sm" me="2" />
          <Text>{t('account:activate.feedbacks.activationLoading.title')}</Text>
        </HStack>
      </Box>
    );
  }

  if (activateAccount.isSuccess) {
    toastSuccess({
      title: t('account:activate.feedbacks.activationSuccess.title'),
    });
    router.replace('/');
    return null;
  }

  if (activateAccount.isError) {
    toastError({
      title: t('account:activate.feedbacks.activationError.title'),
    });
    router.replace('/login');
    return null;
  }

  return null;
}
