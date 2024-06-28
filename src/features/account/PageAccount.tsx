import React, { useId } from 'react';

import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Link,
  LinkBox,
  LinkOverlay,
  Stack,
  Switch,
  useColorMode,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { LuArrowRight, LuLogOut, LuUser } from 'react-icons/lu';

import { ConfirmModal } from '@/components/ConfirmModal';
import { Icon } from '@/components/Icons';
import { AccountDeleteButton } from '@/features/account/AccountDeleteButton';
import { AccountEmailForm } from '@/features/account/AccountEmailForm';
import { AccountProfileForm } from '@/features/account/AccountProfileForm';
import { ADMIN_PATH } from '@/features/admin/constants';
import { AppLayoutPage } from '@/features/app/AppLayoutPage';
import { APP_PATH } from '@/features/app/constants';
import { trpc } from '@/lib/trpc/client';

export default function PageHome() {
  const { t } = useTranslation(['account']);
  const account = trpc.account.get.useQuery();
  const router = useRouter();

  return (
    <AppLayoutPage>
      <Stack spacing={6} divider={<Divider />}>
        <Heading size="md">
          <Icon icon={LuUser} mr={2} opacity={0.6} />
          {t('account:title')}
        </Heading>

        {account.isSuccess && account.data.authorizations.includes('ADMIN') && (
          <Alert as={LinkBox} colorScheme="brand">
            <AlertTitle flex="none">{t('account:admin.title')}</AlertTitle>
            <Link
              as={LinkOverlay}
              ms="auto"
              gap={2}
              display="inline-flex"
              href={ADMIN_PATH || '/'}
            >
              {t('account:admin.button')}
              <Icon icon={LuArrowRight} />
            </Link>
          </Alert>
        )}

        <Stack direction={{ base: 'column', sm: 'row' }}>
          <Heading size="sm" flex={0.5}>
            {t('account:profile.title')}
          </Heading>
          <Box flex={1}>
            <AccountProfileForm />
          </Box>
        </Stack>

        <Stack direction={{ base: 'column', sm: 'row' }}>
          <Heading size="sm" flex={0.5}>
            {t('account:email.title')}
          </Heading>
          <Box flex={1}>
            <AccountEmailForm />
          </Box>
        </Stack>

        <Stack direction={{ base: 'column', sm: 'row' }}>
          <Heading size="sm" flex={0.5}>
            {t('account:preferences.title')}
          </Heading>
          <Stack flex={1} divider={<Divider />} spacing={4}>
            <DarkModeSwitch />
          </Stack>
        </Stack>

        <Stack direction={{ base: 'column', sm: 'row' }}>
          <Box flex={0.5} />
          <Box flex={1}>
            <ConfirmModal
              onConfirm={() =>
                router.push(`/logout?redirect=${APP_PATH}/login`)
              }
              title={t('account:logout.confirm.title')}
              message={t('account:logout.confirm.message')}
              confirmText={t('account:logout.confirm.button')}
              confirmVariant="@dangerSecondary"
            >
              <Button variant="@dangerSecondary" leftIcon={<LuLogOut />}>
                {t('account:logout.button')}
              </Button>
            </ConfirmModal>
          </Box>
        </Stack>
        <Stack direction={{ base: 'column', sm: 'row' }}>
          <Box flex={0.5} />
          <Box flex={1}>
            <AccountDeleteButton />
          </Box>
        </Stack>
      </Stack>
    </AppLayoutPage>
  );
}

const DarkModeSwitch = () => {
  const { t } = useTranslation(['account']);
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
          {t('account:preferences.theme.light')}
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
          {t('account:preferences.theme.dark')}
        </FormLabel>
      </HStack>
    </FormControl>
  );
};
