import React from 'react';

import { Heading } from '@chakra-ui/react';

import { AccountNav } from '@/app/account/AccountNav';
import { Page, PageContent } from '@/app/layout';

export const PagePassword = () => {
  return (
    <Page nav={<AccountNav />}>
      <PageContent>
        <Heading size="md" mb="4">
          Password
        </Heading>
        ...
      </PageContent>
    </Page>
  );
};
