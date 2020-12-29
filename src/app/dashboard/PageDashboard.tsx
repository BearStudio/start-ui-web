import React from 'react';

import { Heading } from '@chakra-ui/react';

import { Page, PageContent, PageBottomBar } from '@/app/layout';

export const PageDashboard = () => {
  return (
    <Page>
      <PageContent>
        <Heading size="md">Dashboard</Heading>
        Body
      </PageContent>
      <PageBottomBar>Footer</PageBottomBar>
    </Page>
  );
};
