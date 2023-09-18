import React, { useEffect } from 'react';

import { Center, Spinner } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { trpc } from '@/lib/trpc/client';

export default function PageLogout() {
  const router = useRouter();
  const queryCache = useQueryClient();
  const logout = trpc.auth.logout.useMutation();
  const logoutMutate = logout.mutate;
  const trpcContext = trpc.useContext();

  useEffect(() => {
    const trigger = async () => {
      await logoutMutate();
      queryCache.clear();
      // Optimistic Update
      trpcContext.auth.checkAuthenticated.setData(undefined, false);
      router.replace('/');
    };
    trigger();
  }, [queryCache, router, logoutMutate, trpcContext.auth.checkAuthenticated]);

  return (
    <Center flex="1">
      <Spinner />
    </Center>
  );
}
