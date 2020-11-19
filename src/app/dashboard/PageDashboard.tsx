import React from 'react';
import { Heading } from '@chakra-ui/react';
import { Page, PageHeader, PageBody, PageFooter } from '@/components';

export const PageDashboard = () => {
  return (
    <Page>
      <PageHeader>
        <Heading size="md">Dashboard</Heading>
      </PageHeader>
      <PageBody>Body</PageBody>
      <PageFooter>Footer</PageFooter>
    </Page>
  );
};
