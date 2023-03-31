import React, { useEffect } from 'react';

import { Box, HStack, Spinner, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { useActivateAccount } from '@/spa/account/account.service';

export const PageActivate = () => {
  const { t } = useTranslation(['account']);
  const activateAccount = useActivateAccount();

  const [searchParams] = useSearchParams();

  useEffect(() => {
    activateAccount.mutate({
      key: searchParams.get('key') ?? 'KEY_NOT_DEFINED',
    });
  }, [activateAccount, searchParams]);

  return (
    <Box p="4" maxW="20rem" m="auto">
      {activateAccount.isLoading && (
        <HStack>
          <Spinner size="sm" me="2" />
          <Text>{t('account:activate.feedbacks.activationLoading.title')}</Text>
        </HStack>
      )}
      {activateAccount.isSuccess &&
        t('account:activate.feedbacks.activationSuccess.title')}
      {activateAccount.isError &&
        t('account:activate.feedbacks.activationError.title')}
    </Box>
  );
};
