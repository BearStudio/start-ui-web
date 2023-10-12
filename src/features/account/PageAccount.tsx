import React from 'react';

import { Divider, Heading, Stack } from '@chakra-ui/react';

import { AccountEmailForm } from '@/features/account/AccountEmailForm';
import { AccountProfileForm } from '@/features/account/AccountProfileForm';
import { AppLayoutPage } from '@/features/app/AppLayoutPage';

export default function PageHome() {
  return (
    <AppLayoutPage>
      <Stack spacing={4}>
        <Heading size="md">Account {/* TODO Translations */}</Heading>

        <Divider />
        <Stack>
          <Heading size="sm">
            Profile informations {/* TODO Translations */}
          </Heading>
          <AccountProfileForm />
        </Stack>
        <Divider />
        <Stack>
          <Heading size="sm">
            Update your email {/* TODO Translations */}
          </Heading>
          <AccountEmailForm />
        </Stack>
      </Stack>
    </AppLayoutPage>
  );
}
