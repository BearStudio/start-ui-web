import React, { useEffect, useRef } from 'react';

import { Center, Spinner } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';

import { trpc } from '@/lib/trpc/client';

export default function PageLogout() {
  const router = useRouter();
  const queryCache = useQueryClient();
  const isTriggeredRef = useRef(false);
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => {
      queryCache.clear();
      // Optimistic Update
      trpcUtils.auth.checkAuthenticated.setData(undefined, {
        isAuthenticated: false,
      });
      router.replace(searchParams.get('redirect') || '/');
    },
  });
  const trpcUtils = trpc.useUtils();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isTriggeredRef.current) return;
    isTriggeredRef.current = true;
    logout.mutate();
  }, [logout]);

  return (
    <Center flex="1">
      <Spinner />
    </Center>
  );
}
