'use client';

import { ReactNode } from 'react';

import { Flex, Progress } from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useAuthContext } from '@/features/auth/AuthContext';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();

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

  if (isAuthenticated) {
    const redirect = searchParams?.get('redirect') ?? '/';
    return router.replace(redirect);
  }

  return <>{children}</>;
}
