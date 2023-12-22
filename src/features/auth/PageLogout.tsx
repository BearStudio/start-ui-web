import React, { useEffect } from 'react';

import { Center, Spinner } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';

import { trpc } from '@/lib/trpc/client';

export default function PageLogout() {
  const router = useRouter();
  const queryCache = useQueryClient();
  const logout = trpc.auth.logout.useMutation();
  const trpcUtils = trpc.useUtils();
  const searchParams = useSearchParams();

  useEffect(() => {
    const trigger = async () => {
      if (!logout.isIdle) return;
      await logout.mutate();
      queryCache.clear();
      // Optimistic Update
      trpcUtils.auth.checkAuthenticated.setData(undefined, {
        isAuthenticated: false,
      });
      router.replace(searchParams.get('redirect') || '/');
    };
    trigger();
  }, [
    searchParams,
    queryCache,
    router,
    logout,
    trpcUtils.auth.checkAuthenticated,
  ]);

  return (
    <Center flex="1">
      <Spinner />
    </Center>
  );
}
