import React from 'react';

import Head from 'next/head';

import { Error404 } from '@/errors';

const Page404 = () => {
  return (
    <>
      <Head>
        <title>Page Not Found</title>
      </Head>
      <Error404 />
    </>
  );
};
export default Page404;
