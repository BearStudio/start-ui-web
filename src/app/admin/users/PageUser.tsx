import React from 'react';

import { Text, Box, Heading, HStack } from '@chakra-ui/react';
import { useParams, useHistory } from 'react-router-dom';

import { useUser } from '@/app/admin/users/service';
import { Page, PageContent, PageBottomBar, PageTopBar } from '@/app/layout';

import { UserStatus } from './UserStatus';

export const PageUser = () => {
  const { login } = useParams();
  const history = useHistory();
  const { user } = useUser(login);
  return (
    <Page containerSize="md" isFocusMode>
      <PageTopBar showBack onBack={() => history.goBack()}>
        <HStack spacing="4">
          <Box flex="1">
            <Heading size="sm">User {user?.login}</Heading>
            <Text fontSize="sm" color="gray.600">
              {user?.email}
            </Text>
          </Box>
          {!!user && (
            <Box>
              <UserStatus isActivated={user?.activated} />
            </Box>
          )}
        </HStack>
      </PageTopBar>
      <PageContent>Body</PageContent>
      <PageBottomBar>Footer</PageBottomBar>
    </Page>
  );
};
