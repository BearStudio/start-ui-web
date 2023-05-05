'use client';

import { ReactNode, useEffect, useState } from 'react';

import { Flex, Progress } from '@chakra-ui/react';

import { Layout } from '@/layout/Layout';
import { useAuthContext } from '@/spa/auth/AuthContext';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading)
    return (
      <Flex flex="1" align="flex-start">
        <Progress
          w="full"
          h="0.4rem"
          bg="gray.100"
          colorScheme="brand"
          isIndeterminate
        />
      </Flex>
    );

  if (!isAuthenticated) return null; // TODO Redirect

  return <Layout>{children}</Layout>;
}
