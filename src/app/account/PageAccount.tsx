import React from 'react';
import { Heading } from '@chakra-ui/react';
import { useAccount } from '@/app/account/service';
import { Page, PageBody, PageHeader } from '@/components';

export const PageAccount = () => {
  const { account } = useAccount();
  return (
    <Page>
      <PageHeader>
        <Heading>Account</Heading>
      </PageHeader>
      <PageBody>
        <pre>{JSON.stringify(account, null, 2)}</pre>
      </PageBody>
    </Page>
  );
};
