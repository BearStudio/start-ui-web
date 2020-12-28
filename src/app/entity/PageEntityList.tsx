import React from 'react';

import { Heading } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

import { Page, PageBody, PageHeader } from '@/app/layout';

export const PageEntityList = () => {
  return (
    <Page>
      <PageHeader>
        <Heading size="md">PageEntityList Component</Heading>
      </PageHeader>
      <PageBody>
        <Link to="/entity/create">Create Entity</Link>
      </PageBody>
    </Page>
  );
};
