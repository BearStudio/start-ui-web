import React, { useEffect } from 'react';

import { Box, HStack, Spinner, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { useActivateAccount } from '@/app/account/account.service';
import { useSearchParams } from '@/app/router';

export const PageActivate = () => {
  const { t } = useTranslation();
  const {
    mutate: activateAccount,
    isError,
    isSuccess,
    isLoading,
  } = useActivateAccount();
  const { searchParams } = useSearchParams();

  useEffect(() => {
    activateAccount({ key: searchParams.get('key') });
  }, [activateAccount, searchParams]);

  return (
    <Box p="4" maxW="20rem" m="auto">
      {isLoading && (
        <HStack>
          <Spinner size="sm" me="2" />
          <Text>{t('account:activate.feedbacks.activationLoading.title')}</Text>
        </HStack>
      )}
      {isSuccess && t('account:activate.feedbacks.activationSuccess.title')}
      {isError && t('account:activate.feedbacks.activationError.title')}
    </Box>
  );
};
