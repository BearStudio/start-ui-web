import React from 'react';

import { Box, useColorModeValue } from '@chakra-ui/react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

import { Page, PageContent } from '@/app/layout';

import { AdminNav } from '../AdminNav';

export const PageApiDocumentation = () => {
  const bg = useColorModeValue('transparent', 'gray.200');
  return (
    <Page containerSize="xl" nav={<AdminNav />}>
      <PageContent>
        <Box bg={bg} borderRadius="md">
          <SwaggerUI url="/open-api.json" />
        </Box>
      </PageContent>
    </Page>
  );
};
