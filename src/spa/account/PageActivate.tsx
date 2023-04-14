import React, { useEffect } from 'react';

import { Box, HStack, Spinner, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useToastError, useToastSuccess } from '@/components/Toast';
import { useActivateAccount } from '@/spa/account/account.service';

export const PageActivate = () => {
  const { t } = useTranslation(['account']);
  const activateAccount = useActivateAccount();

  const [searchParams] = useSearchParams();

  const toastError = useToastError();
  const toastSuccess = useToastSuccess();

  const navigate = useNavigate();

  useEffect(() => {
    activateAccount.mutate(
      { key: searchParams.get('key') ?? 'KEY_NOT_DEFINED' },
      {
        onError: () => {
          navigate('/');
          toastError({
            title: t('account:activate.feedbacks.activationError.title'),
          });
        },
        onSuccess: () => {
          navigate('/');
          toastSuccess({
            title: t('account:activate.feedbacks.activationSuccess.title'),
          });
        },
      }
    );
  }, [activateAccount, navigate, searchParams, t, toastError, toastSuccess]);

  return (
    <Box p="4" maxW="20rem" m="auto">
      {activateAccount.isLoading && (
        <HStack>
          <Spinner size="sm" me="2" />
          <Text>{t('account:activate.feedbacks.activationLoading.title')}</Text>
        </HStack>
      )}
    </Box>
  );
};
