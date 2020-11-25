import React from 'react';

import { ChakraProvider } from '@chakra-ui/react';

import { AuthProvider } from '@/app/auth/AuthContext';
import '@/config/axios';
import '@/config/dayjs';
import theme from '@/theme';

export const Providers = ({ children }) => {
  return (
    <AuthProvider>
      <ChakraProvider theme={theme}>{children}</ChakraProvider>
    </AuthProvider>
  );
};
