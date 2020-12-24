import React from 'react';

import { Text, Box, IconButton, Heading, HStack } from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import { useParams, useHistory } from 'react-router-dom';

import { useUser } from '@/app/admin/users/service';
import { Page, PageBody, PageFooter, PageHeader } from '@/components';

import { UserStatus } from './UserStatus';
import { useTranslation } from 'react-i18next';

export const PageUser = () => {
  const { t } = useTranslation();
  const { login } = useParams();
  const history = useHistory();
  const { user } = useUser(login);
  return (
    <Page containerSize="md" isFocusMode>
      <PageHeader>
        <HStack spacing="4">
          <Box ml={{ base: 0, lg: '-3.5rem' }}>
            <IconButton
              aria-label="Go Back"
              icon={<FiArrowLeft fontSize="lg" />}
              variant="ghost"
              onClick={() => history.goBack()}
            />
          </Box>
          <Box flex="1">
            <Heading size="sm">{t('admin:users.user')} {user?.login}</Heading>
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
