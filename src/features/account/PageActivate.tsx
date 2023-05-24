import React, { useEffect } from 'react';

import { Box, HStack, Spinner, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useToastError, useToastSuccess } from '@/components/Toast';
import { useActivateAccount } from '@/features/account/service';

export default function PageActivate() {
  const { t } = useTranslation(['account']);
  const navigate = useNavigate();
  const activateAccountMutation = useActivateAccount({
    onError: () => {
      toastError({
        title: t('account:activate.feedbacks.activationError.title'),
      });
      navigate('/');
    },
    onSuccess: () => {
      toastSuccess({
        title: t('account:activate.feedbacks.activationSuccess.title'),
      });
      navigate('/');
    },
  });
  const activateAccount = activateAccountMutation.mutate;
  const [searchParams] = useSearchParams();
  const key = searchParams?.get('key')?.toString();

  const toastError = useToastError();
  const toastSuccess = useToastSuccess();

  useEffect(() => {
    if (!key) return () => undefined;
    activateAccount({ key });
  }, [activateAccount, key, t]);

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
