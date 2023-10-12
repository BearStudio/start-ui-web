import React from 'react';

import { Button, Divider, Flex, Heading, Stack } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

import { ConfirmModal } from '@/components/ConfirmModal';
import { AccountEmailForm } from '@/features/account/AccountEmailForm';
import { AccountProfileForm } from '@/features/account/AccountProfileForm';
import { AppLayoutPage } from '@/features/app/AppLayoutPage';

export default function PageHome() {
  const router = useRouter();

  return (
    <AppLayoutPage containerMaxWidth="md">
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
        <Divider />
        <Flex>
          <ConfirmModal
            onConfirm={() => router.push('/logout')}
            title="Account logout" // TODO translations
            message="Your about to terminate your session." // TODO translations
            confirmText="Logout" // TODO translations
            confirmVariant="@danger"
          >
            <Button variant="@danger">Logout {/* TODO Translations */}</Button>
          </ConfirmModal>
        </Flex>
      </Stack>
    </AppLayoutPage>
  );
}
