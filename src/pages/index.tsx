import React, { useEffect } from 'react';

import { Center } from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { Loader } from '@/app/layout';
import { APP_BASENAME } from '@/constants/routing';

const Index = () => {
  const router = useRouter();
  useEffect(() => {
    router.push(`/${APP_BASENAME}`);
  }, [router]);

  return (
    <>
      <Head>
        <title>Start UI</title>
      </Head>
      <Center flex="1">
        <Loader />
      </Center>
    </>
  );
};
export default Index;
