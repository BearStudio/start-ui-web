import React from 'react';

import { Heading } from '@chakra-ui/react';
import { Link, useHistory } from 'react-router-dom';

import { Page, PageBody, PageFooter, PageHeader } from '@/app/layout';

export const PageEntityCreate = () => {
  const history = useHistory();
  return (
    <Page containerSize="md" isFocusMode>
      <PageHeader showBack onBack={() => history.goBack()}>
        <Heading size="sm">PageEntityCreate Component</Heading>
      </PageHeader>
      <PageBody>
        <Link to="/entity">Go to Entity</Link>
      </PageBody>
      <PageFooter>Footer</PageFooter>
    </Page>
  );
};
