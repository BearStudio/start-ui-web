import React from 'react';

import { Button, ButtonGroup, Heading } from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';

import { Page, PageContent, PageBottomBar, PageTopBar } from '@/app/layout';

export const PageUserCreate = () => {
  const history = useHistory();
  return (
    <Page containerSize="md" isFocusMode>
      <PageTopBar showBack onBack={() => history.goBack()}>
        <Heading size="sm">PageUserCreate Component</Heading>
      </PageTopBar>
      <PageContent>...</PageContent>
      <PageBottomBar>
        <ButtonGroup justifyContent="space-between">
          <Button onClick={() => history.goBack()}>Cancel</Button>
          <Button colorScheme="brand">Create User</Button>
        </ButtonGroup>
      </PageBottomBar>
    </Page>
  );
};
