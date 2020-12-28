import React from 'react';

import { Button, ButtonGroup, Heading } from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';

import { Page, PageBody, PageFooter, PageHeader } from '@/app/layout';

export const PageUserCreate = () => {
  const history = useHistory();
  return (
    <Page containerSize="md" isFocusMode>
      <PageHeader showBack onBack={() => history.goBack()}>
        <Heading size="sm">PageUserCreate Component</Heading>
      </PageHeader>
      <PageBody>...</PageBody>
      <PageFooter>
        <ButtonGroup justifyContent="space-between">
          <Button onClick={() => history.goBack()}>Cancel</Button>
          <Button colorScheme="brand">Create User</Button>
        </ButtonGroup>
      </PageFooter>
    </Page>
  );
};
