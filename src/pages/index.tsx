import React from 'react';
import Head from 'next/head';

import { App } from '@/app/App';
import { isBrowser } from '@/utils/ssr';
import { useTranslation } from 'react-i18next';

const Index = () => {
  const { t } = useTranslation('common');
  return (
    <>
      <Head>
        <title>{t('appTitle')}</title>
      </Head>
      <div suppressHydrationWarning={true}>{isBrowser && <App />}</div>
    </>
  );
};
export default Index;
