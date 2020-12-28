import React from 'react';

import { Box, Heading, HStack, IconButton } from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import { Link, useHistory } from 'react-router-dom';

import { Page, PageBody, PageFooter, PageHeader } from '@/app/layout';

export const PageEntityCreate = () => {
  const history = useHistory();
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
            <Heading size="sm">PageEntityCreate Component</Heading>
          </Box>
        </HStack>
      </PageHeader>
      <PageBody>
        <Link to="/entity">Go to Entity</Link>
      </PageBody>
      <PageFooter>Footer</PageFooter>
    </Page>
  );
};
