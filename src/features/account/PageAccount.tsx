import React, { useId } from 'react';

import {
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Stack,
  Switch,
  useColorMode,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { LuUser } from 'react-icons/lu';

import { ConfirmModal } from '@/components/ConfirmModal';
import { Icon } from '@/components/Icons';
import { AccountEmailForm } from '@/features/account/AccountEmailForm';
import { AccountProfileForm } from '@/features/account/AccountProfileForm';
import { AppLayoutPage } from '@/features/app/AppLayoutPage';

export default function PageHome() {
  const router = useRouter();

  return (
    <AppLayoutPage>
      <Stack spacing={6} divider={<Divider />}>
        <Heading size="md">
          <Icon icon={LuUser} mr={2} opacity={0.6} />
          Account {/* TODO Translations */}
        </Heading>

        <Stack direction={{ base: 'column', sm: 'row' }}>
          <Heading size="sm" flex={0.5}>
            Profile informations {/* TODO Translations */}
          </Heading>
          <Box flex={1}>
            <AccountProfileForm />
          </Box>
        </Stack>

        <Stack direction={{ base: 'column', sm: 'row' }}>
          <Heading size="sm" flex={0.5}>
            Update your email {/* TODO Translations */}
          </Heading>
          <Box flex={1}>
            <AccountEmailForm />
          </Box>
        </Stack>

        <Stack direction={{ base: 'column', sm: 'row' }}>
          <Heading size="sm" flex={0.5}>
            Preferences {/* TODO Translations */}
          </Heading>
          <Stack flex={1} divider={<Divider />} spacing={4}>
            <DarkModeSwitch />
          </Stack>
        </Stack>

        <Stack direction={{ base: 'column', sm: 'row' }}>
          <Box flex={0.5} />
          <Box flex={1}>
            <ConfirmModal
              onConfirm={() => router.push('/logout')}
              title="Account logout" // TODO translations
              message="You are about to end your session" // TODO translations
              confirmText="Logout" // TODO translations
              confirmVariant="@danger"
            >
              <Button variant="@danger">
                Logout {/* TODO Translations */}
              </Button>
            </ConfirmModal>
          </Box>
        </Stack>
      </Stack>
    </AppLayoutPage>
  );
}

const DarkModeSwitch = () => {
  const { colorMode, setColorMode } = useColorMode();
  const id = useId();

  return (
    <FormControl display="flex" alignItems="center">
      <HStack>
        <FormLabel
          as={colorMode === 'light' ? 'span' : undefined}
          opacity={colorMode !== 'light' ? 0.5 : undefined}
          htmlFor={id}
          mb="0"
          mr={0}
        >
          Light Mode {/* TODO Translations */}
        </FormLabel>
        <Switch
          colorScheme="brand"
          id={id}
          isChecked={colorMode === 'dark'}
          onChange={(e) => setColorMode(e.target.checked ? 'dark' : 'light')}
        />
        <FormLabel
          as={colorMode === 'dark' ? 'span' : undefined}
          opacity={colorMode !== 'dark' ? 0.5 : undefined}
          htmlFor={id}
          mb="0"
        >
          Dark Mode {/* TODO Translations */}
        </FormLabel>
      </HStack>
    </FormControl>
  );
};
