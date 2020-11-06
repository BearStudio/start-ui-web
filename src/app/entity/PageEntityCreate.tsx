import { Page, PageBody, PageHeader } from '@/components';
import React from 'react';
import { Link } from 'react-router-dom';

export const PageEntityCreate = () => {
  return (
    <Page>
      <PageHeader>PageEntityCreate Component</PageHeader>
      <PageBody>
        <Link to="../">Go to Entity</Link>
      </PageBody>
    </Page>
  );
};
