import React from 'react';

import { Heading } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

import { Page, PageContent } from '@/app/layout';

export const PageEntityList = () => {
  return (
    <Page>
      <PageContent>
        <Heading size="md">PageEntityList Component</Heading>
        <Link to="/entity/create">Create Entity</Link>
      </PageContent>
    </Page>
  );
};
