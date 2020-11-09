import React from 'react';
import { Providers } from '@/Providers';
import { Viewport } from '@/components/Viewport';
import { ErrorBoundary } from '@/errors';

const App = ({ Component, pageProps }) => {
  return (
    <Providers>
      <ErrorBoundary>
        <Viewport>
          <Component {...pageProps} />
        </Viewport>
      </ErrorBoundary>
    </Providers>
  );
};
export default App;
