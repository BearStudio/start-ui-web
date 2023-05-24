import React from 'react';

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
} from '@chakra-ui/react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

import { Page, PageContent } from '@/components/Page';
import { AdminNav } from '@/features/admin/AdminNav';

export default function PageApiDocumentation() {
  return (
    <Page containerSize="xl" nav={<AdminNav />}>
      <PageContent>
        <Alert status="warning" mb={4}>
          <AlertIcon />
          <AlertTitle>Swagger Example</AlertTitle>
          <AlertDescription>
            Replace with your API swagger schema
          </AlertDescription>
        </Alert>
        <Box borderRadius="md" bg="transparent" _dark={{ bg: 'gray.200' }}>
          <SwaggerUI url="https://petstore.swagger.io/v2/swagger.json" />
        </Box>
      </PageContent>
    </Page>
  );
}
