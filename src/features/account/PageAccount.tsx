import React from 'react';

import { Container, Divider, Heading, Stack } from '@chakra-ui/react';

import { AccountEmailForm } from '@/features/account/AccountEmailForm';
import { AccountProfileForm } from '@/features/account/AccountProfileForm';

export default function PageHome() {
  return (
    <Container py={{ base: 6, md: 0 }}>
      <Stack spacing={6}>
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
    </Container>
  );
}
