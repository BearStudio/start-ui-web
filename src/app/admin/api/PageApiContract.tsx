import React from 'react';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

import { Page, PageContent } from '@/app/layout';
import jsonAPI from '@/mocks/openapi/buildOpenapi.json';

import { AdminNav } from '../AdminNav';

export const PageApiContract = () => {
  return (
    <Page containerSize="xl" nav={<AdminNav />}>
      <PageContent>
        <SwaggerUI spec={jsonAPI} />
      </PageContent>
    </Page>
  );
};
