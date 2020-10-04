import React from 'react';
import Head from 'next/head';
import { isBrowser } from '@/utils/ssr';
import { App } from '@/app/App';

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
