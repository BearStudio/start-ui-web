'use client';

import React, { useEffect } from 'react';

import { Box, HStack, Spinner, Text } from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useToastError, useToastSuccess } from '@/components/Toast';
import { useActivateAccount } from '@/features/account/service';

export default function PageActivate() {
  const { t } = useTranslation(['account']);
  const activateAccountMutation = useActivateAccount({
    onError: () => {
      toastError({
        title: t('account:activate.feedbacks.activationError.title'),
      });
      router.push('/');
    },
    onSuccess: () => {
      toastSuccess({
        title: t('account:activate.feedbacks.activationSuccess.title'),
      });
      router.push('/');
    },
  });
  const activateAccount = activateAccountMutation.mutate;
  const searchParams = useSearchParams();
  const key = searchParams?.get('key')?.toString();

  const toastError = useToastError();
  const toastSuccess = useToastSuccess();

  const router = useRouter();

  useEffect(() => {
    if (!key) return () => undefined;
    activateAccount({ key });
  }, [activateAccount, router, key, t]);

  return (
    <Box p="4" maxW="20rem" m="auto">
      {activateAccountMutation.isLoading && (
        <HStack>
          <Spinner size="sm" me="2" />
          <Text>{t('account:activate.feedbacks.activationLoading.title')}</Text>
        </HStack>
      )}
    </Box>
  );
}
