import React from 'react';

import Head from 'next/head';

import { App as AppComponent } from '@/app/App';
import { isBrowser } from '@/utils/ssr';

const App = () => {
  return (
    <>
      <Head>
        <title>Start UI</title>
      </Head>
      <div suppressHydrationWarning={true}>{isBrowser && <AppComponent />}</div>
    </>
  );
};
export default App;
