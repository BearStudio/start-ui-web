import React from 'react';

import { Link } from 'react-router-dom';

import { Page, PageBody, PageHeader } from '@/components';

export const PageEntityCreate = () => {
  return (
    <Page>
      <PageHeader>PageEntityCreate Component</PageHeader>
      <PageBody>
        <Link to="/entity">Go to Entity</Link>
      </PageBody>
    </Page>
  );
};
