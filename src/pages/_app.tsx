import React from 'react';
import { Providers } from '@/Providers';

const App = ({ Component, pageProps }) => {
  return (
    <Providers>
      <Component {...pageProps} />
    </Providers>
  );
};
export default App;
