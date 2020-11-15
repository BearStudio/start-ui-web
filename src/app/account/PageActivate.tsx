import React, { useEffect } from 'react';
import { Box, Spinner } from '@chakra-ui/react';
import { useActivateAccount } from '@/app/account/service';
import { useSearchParams } from '@/app/router';

export const PageActivate = () => {
  const [
    activateAccount,
    { isError, isSuccess, isLoading },
  ] = useActivateAccount();
  const { searchParams } = useSearchParams();

  useEffect(() => {
    activateAccount({ key: searchParams.get('key') });
  }, [activateAccount, searchParams]);

  return (
    <Box p="4" maxW="20rem" m="auto">
      {isLoading && <Spinner size="sm" mr="2" />}
      Account Activation {isSuccess && 'Success'}
      {isError && 'Error'}
    </Box>
  );
};
