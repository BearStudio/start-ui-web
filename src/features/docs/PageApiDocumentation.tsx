import React from 'react';

import { Box } from '@chakra-ui/react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

import {
  AdminLayoutPage,
  AdminLayoutPageContent,
} from '@/features/admin/AdminLayoutPage';

export default function PageApiDocumentation() {
  return (
    <AdminLayoutPage noContainer>
      <AdminLayoutPageContent>
        <Box
          borderRadius="md"
          mt={-8}
          bg="transparent"
          _dark={{ bg: 'gray.200' }}
        >
          <SwaggerUI url="/api/openapi.json" />
        </Box>
      </AdminLayoutPageContent>
    </AdminLayoutPage>
  );
}
