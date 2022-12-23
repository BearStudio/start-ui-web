import React, { useEffect } from 'react';

import { Box, HStack, Spinner, Text, useToast } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useActivateAccount } from '@/spa/account/account.service';

export const PageActivate = () => {
  const { t } = useTranslation(['account']);
  const activateAccount = useActivateAccount();

  const [searchParams] = useSearchParams();
  const toast = useToast();
  const navigate = useNavigate();
  useEffect(() => {
    activateAccount.mutate({
      key: searchParams.get('key') ?? 'KEY_NOT_DEFINED',
    });
  }, [activateAccount, searchParams]);

  if (isError) {
    navigate('/');
    toast({
      title: t('account:activate.feedbacks.activationError.title'),
      status: 'error',
      duration: 9000,
      isClosable: true,
      position: 'top-right',
    });
  }
  if (isSuccess) {
    navigate('/');
    toast({
      title: t('account:activate.feedbacks.activationSuccess.title'),
      status: 'success',
      duration: 9000,
      isClosable: true,
      position: 'top-right',
    });
  }
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
