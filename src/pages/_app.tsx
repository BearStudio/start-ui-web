import React from 'react';
import { Providers } from '@/Providers';
import { Viewport } from '@/components/Viewport';

const App = ({ Component, pageProps }) => {
  return (
    <Providers>
      <Viewport>
        <Component {...pageProps} />
      </Viewport>
    </Providers>
  );
};
export default App;
