import React from 'react';

import { Heading } from '@chakra-ui/react';
import { Link, useRouteMatch } from 'react-router-dom';

import { Page, PageBody, PageHeader } from '@/components';

export const PageUserView = () => {
  const { path } = useRouteMatch();

  return (
    <Page containerSize="xl">
      <PageHeader>
        <Heading size="md">User</Heading>
      </PageHeader>
      <PageBody>TODO</PageBody>
    </Page>
  );
};
