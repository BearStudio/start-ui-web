import React, { useEffect } from 'react';

import { Center } from '@chakra-ui/react';
import { useRouter } from 'next/router';

import { Loader } from '@/spa/layout';

const Index = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/app');
  }, [router]);

  return (
    <Center flex="1">
      <Loader />
    </Center>
  );
};
export default Index;
