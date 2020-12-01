import React from 'react';

import { Text, Box, IconButton, Heading, HStack } from '@chakra-ui/react';
import { ArrowLeft } from 'phosphor-react';
import { useParams, useHistory } from 'react-router-dom';

import { useUser } from '@/app/admin/users/service';
import { Page, PageBody, PageFooter, PageHeader } from '@/components';

import { UserStatus } from './UserStatus';

export const PageUserView = () => {
  const { userLogin } = useParams();
  const history = useHistory();
  const { user } = useUser(userLogin);
  return (
    <Page containerSize="md" isFocusMode>
      <PageHeader>
        <HStack spacing="4">
          <Box ml={{ base: 0, lg: '-3.5rem' }}>
            <IconButton
              aria-label="Go Back"
              icon={<ArrowLeft />}
              variant="ghost"
              onClick={() => history.goBack()}
            />
          </Box>
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
      </PageHeader>
      <PageBody>Body</PageBody>
      <PageFooter>Footer</PageFooter>
    </Page>
  );
};
