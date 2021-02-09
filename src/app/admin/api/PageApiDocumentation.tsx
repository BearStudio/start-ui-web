import React from 'react';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

import { Page, PageContent } from '@/app/layout';

import { AdminNav } from '../AdminNav';

export const PageApiDocumentation = () => {
  return (
    <Page containerSize="xl" nav={<AdminNav />}>
      <PageContent>
        <SwaggerUI url="/open-api.json" />
      </PageContent>
    </Page>
  );
};
