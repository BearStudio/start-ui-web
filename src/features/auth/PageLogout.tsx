import React, { useEffect } from 'react';

import { Center, Spinner } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function PageLogout() {
  const router = useRouter();
  const queryCache = useQueryClient();

  useEffect(() => {
    const logout = async () => {
      await signOut({ redirect: false });
      queryCache.clear();
      router.replace('/');
    };
    logout();
  }, [queryCache, router]);

  return (
    <Center flex="1">
      <Spinner />
    </Center>
  );
}
