import React from 'react';

import { Heading } from '@chakra-ui/react';

import { Page, PageContent } from '@/app/layout';

export const PageDashboard = () => {
  return (
    <Page>
      <PageContent>
        <Heading size="md">Dashboard</Heading>
        Body
      </PageContent>
    </Page>
  );
};
