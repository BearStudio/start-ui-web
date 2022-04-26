import React from 'react';

import { Box } from '@chakra-ui/react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

import { AdminNav } from '@/app/admin/AdminNav';
import { Page, PageContent } from '@/app/layout';

export const PageApiDocumentation = () => {
  return (
    <Page containerSize="xl" nav={<AdminNav />}>
      <PageContent>
        <Box borderRadius="md" bg="transparent" _dark={{ bg: 'gray.200' }}>
          <SwaggerUI url="/open-api.json" />
        </Box>
      </PageContent>
    </Page>
  );
};
