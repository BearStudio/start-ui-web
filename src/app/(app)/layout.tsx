'use client';

import { ReactNode } from 'react';

import { Flex, Progress } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

import { useAuthContext } from '@/features/auth/AuthContext';
import { Layout } from '@/layout/Layout';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  if (isLoading) {
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
  }

  if (!isAuthenticated) {
    const redirect =
      !pathname || ['/', '/logout'].includes(pathname)
        ? '/login'
        : `/login?redirect=${pathname}`;
    return router.replace(redirect);
  }

  return <Layout>{children}</Layout>;
}
