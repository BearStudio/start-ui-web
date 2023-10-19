import React from 'react';

import { Flex, useBreakpointValue } from '@chakra-ui/react';
import { API } from '@stoplight/elements';
import '@stoplight/elements/styles.min.css';

import {
  AdminLayoutPage,
  AdminLayoutPageContent,
} from '@/features/admin/AdminLayoutPage';

export default function PageApiDocumentation() {
  const isMobile = useBreakpointValue({ base: true, lg: false });

  return (
    <AdminLayoutPage noContainer>
      <AdminLayoutPageContent>
        <Flex
          direction="column"
          position="absolute"
          inset="0"
          overflow="auto"
          p={{ base: '4', lg: '0' }}
        >
          <API
            apiDescriptionUrl="/api/openapi.json"
            layout={isMobile ? 'stacked' : 'sidebar'}
            router="memory"
          />
        </Flex>
      </AdminLayoutPageContent>
    </AdminLayoutPage>
  );
}
