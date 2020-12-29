import React from 'react';

import { Heading } from '@chakra-ui/react';
import { Link, useHistory } from 'react-router-dom';

import { Page, PageContent, PageBottomBar, PageTopBar } from '@/app/layout';

export const PageEntityCreate = () => {
  const history = useHistory();
  return (
    <Page containerSize="md" isFocusMode>
      <PageTopBar showBack onBack={() => history.goBack()}>
        <Heading size="sm">PageEntityCreate Component</Heading>
      </PageTopBar>
      <PageContent>
        <Link to="/entity">Go to Entity</Link>
      </PageContent>
      <PageBottomBar>Footer</PageBottomBar>
    </Page>
  );
};
