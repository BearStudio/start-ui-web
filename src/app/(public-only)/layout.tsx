'use client';

import { ReactNode } from 'react';

import { Flex, Progress } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

import { useAuthContext } from '@/app/AuthContext';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

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

  if (isAuthenticated) return router.replace('/');

  return <>{children}</>;
}
