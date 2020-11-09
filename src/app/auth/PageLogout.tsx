import React, { useEffect } from 'react';
import { useAuthContext } from '@/app/auth/AuthContext';
import { Center, Spinner } from '@chakra-ui/core';

export const PageLogout = () => {
  const { updateToken } = useAuthContext();

  useEffect(() => {
    updateToken(null);
    window.location.href = '/';
  }, [updateToken]);

  return (
    <Center flex="1">
      <Spinner />
    </Center>
  );
};
