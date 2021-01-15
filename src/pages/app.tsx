import React from 'react';

import Head from 'next/head';

import { App } from '@/app/App';
import { isBrowser } from '@/utils/ssr';

const Index = () => {
  return (
    <>
      <Head>
        <title>Start UI</title>
      </Head>
      <div suppressHydrationWarning={true}>{isBrowser && <App />}</div>
    </>
  );
};
export default Index;
