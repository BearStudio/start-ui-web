import React from 'react';
import { Link } from 'react-router-dom';
import { Page, PageBody, PageHeader } from '@/components';

export const PageEntityList = () => {
  return (
    <Page>
      <PageHeader>PageEntityList Component</PageHeader>
      <PageBody>
        <Link to="./create">Create Entity</Link>
      </PageBody>
    </Page>
  );
};
