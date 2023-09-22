import React, { useEffect, useRef } from 'react';

import { Box, HStack, Spinner, Text } from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useToastError, useToastSuccess } from '@/components/Toast';
import { trpc } from '@/lib/trpc/client';

export default function PageActivate() {
  const { t } = useTranslation(['auth']);
  const router = useRouter();
  const isTriggeredRef = useRef(false);

  const toastError = useToastError();
  const toastSuccess = useToastSuccess();
  const activateAccount = trpc.auth.activate.useMutation({
    onSuccess: () => {
      toastSuccess({
        title: t('auth:activate.feedbacks.activationSuccess.title'),
      });
      router.replace('/');
    },
    onError: () => {
      toastError({
        title: t('auth:activate.feedbacks.activationError.title'),
      });
      router.replace('/');
    },
  });
  const searchParams = useSearchParams();
  const token = searchParams?.get('token')?.toString();

  useEffect(() => {
    if (!isTriggeredRef.current) {
      isTriggeredRef.current = true;
      activateAccount.mutate({ token });
    }
  }, [activateAccount, token]);

  return (
    <Box p="4" maxW="20rem" m="auto">
      <HStack>
        <Spinner size="sm" me="2" />
        <Text>{t('auth:activate.feedbacks.activationLoading.title')}</Text>
      </HStack>
    </Box>
  );
}
