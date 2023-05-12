import React from 'react';

import { Box } from '@chakra-ui/react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

import { Page, PageContent } from '@/components/Page';
import { AdminNav } from '@/features/admin/AdminNav';

export default function PageApiDocumentation() {
  return (
    <Page containerSize="xl" nav={<AdminNav />}>
      <PageContent>
        <Box borderRadius="md" bg="transparent" _dark={{ bg: 'gray.200' }}>
          <SwaggerUI url="/api/open-api" />
        </Box>
      </PageContent>
    </Page>
  );
}
