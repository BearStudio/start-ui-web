import React from 'react';

import {
  Avatar,
  Box,
  BoxProps,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  IconButton,
  IconButtonProps,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  MenuProps,
  Spinner,
  Stack,
  StackProps,
  Text,
  useBreakpointValue,
  useClipboard,
  useColorMode,
} from '@chakra-ui/react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  LuBookOpen,
  LuCheck,
  LuCopy,
  LuLogOut,
  LuMenu,
  LuMoon,
  LuSmartphone,
  LuSun,
  LuUser,
} from 'react-icons/lu';

import { Icon } from '@/components/Icons';
import { Logo } from '@/components/Logo';
import { useAdminLayoutContext } from '@/features/admin/AdminLayout';
import { LinkAdmin } from '@/features/admin/LinkAdmin';
import { ADMIN_PATH } from '@/features/admin/constants';
import { LinkApp } from '@/features/app/LinkApp';
import { useRtl } from '@/hooks/useRtl';
import { trpc } from '@/lib/trpc/client';

import buildInfo from '../../../scripts/.build-info.json';

const AdminNavBarMainMenu = ({ ...rest }: StackProps) => {
  const { t } = useTranslation(['admin']);
  return (
    <Stack direction="row" spacing="1" {...rest}>
      <AdminNavBarMainMenuItem href="/dashboard">
        {t('admin:layout.mainMenu.dashboard')}
      </AdminNavBarMainMenuItem>
      <AdminNavBarMainMenuItem href="/repositories">
        {t('admin:layout.mainMenu.repositories')}
      </AdminNavBarMainMenuItem>
      <AdminNavBarMainMenuItem href="/management">
        {t('admin:layout.mainMenu.management')}
      </AdminNavBarMainMenuItem>
    </Stack>
  );
};

const AdminNavBarAccountMenu = ({ ...rest }: Omit<MenuProps, 'children'>) => {
  const { t } = useTranslation(['admin']);

  const { colorMode, toggleColorMode } = useColorMode();
  const account = trpc.account.get.useQuery();
  const router = useRouter();

  return (
    <Box color="gray.800" _dark={{ color: 'white' }}>
      <Menu placement="bottom-end" {...rest}>
        <MenuButton borderRadius="full" _focusVisible={{ shadow: 'outline' }}>
          <Avatar
            size="sm"
            src={account.data?.image ?? undefined}
            name={account.data?.email ?? ''}
          >
            {account.isLoading && <Spinner size="xs" />}
          </Avatar>
        </MenuButton>
        <MenuList maxW="12rem" overflow="hidden">
          <MenuGroup title={account.data?.email ?? ''} noOfLines={1}>
            <MenuItem
              as={LinkAdmin}
              href="/account"
              icon={<Icon icon={LuUser} fontSize="lg" color="gray.400" />}
            >
              {t('admin:layout.accountMenu.myAccount')}
            </MenuItem>
            <MenuItem
              as={LinkAdmin}
              href="/docs/api"
              icon={<Icon icon={LuBookOpen} fontSize="lg" color="gray.400" />}
            >
              {t('admin:layout.accountMenu.apiDocs')}
            </MenuItem>

            {account.data?.authorizations.includes('APP') && (
              <MenuItem
                as={LinkApp}
                href="/"
                icon={
                  <Icon icon={LuSmartphone} fontSize="lg" color="gray.400" />
                }
              >
                {t('admin:layout.accountMenu.openApp')}
              </MenuItem>
            )}
          </MenuGroup>

          <MenuDivider />
          <MenuItem
            icon={
              <Icon
                icon={colorMode === 'dark' ? LuSun : LuMoon}
                fontSize="lg"
                color="gray.400"
              />
            }
            onClick={() => toggleColorMode()}
          >
            {colorMode === 'dark'
              ? t('admin:layout.accountMenu.switchColorModeLight')
              : t('admin:layout.accountMenu.switchColorModeDark')}
          </MenuItem>
          <MenuDivider />
          <MenuItem
            icon={<Icon icon={LuLogOut} fontSize="lg" color="gray.400" />}
            onClick={() => router.push(`/logout?redirect=${ADMIN_PATH || ''}`)}
          >
            {t('admin:layout.accountMenu.logout')}
          </MenuItem>
          <AdminNavBarAccountMenuVersion />
        </MenuList>
      </Menu>
    </Box>
  );
};

export const AdminNavBar = (props: BoxProps) => {
  const showDrawer = useBreakpointValue({
    base: true,
    md: false,
  });

  return (
    <Box {...props}>
      <Flex
        color="gray.50"
        align="center"
        pt="safe-top"
        px="4"
        h="calc(4rem + env(safe-area-inset-top))"
        bg="gray.800"
        boxShadow="layout"
        borderBottom="1px solid transparent"
        _dark={{
          bg: 'gray.900',
          color: 'white',
          borderBottomColor: 'gray.800',
          boxShadow: 'layout-dark',
        }}
      >
        <AdminNavBarDrawerButton
          display={{ base: 'flex', md: 'none' }}
          ms="-0.5rem"
        />
        <Box as={LinkAdmin} href="/" mx={{ base: 'auto', md: 0 }}>
          <Logo />
        </Box>
        <AdminNavBarMainMenu
          me="auto"
          ms="4"
          display={{ base: 'none', md: 'flex' }}
        />
        <AdminNavBarAccountMenu />
      </Flex>
      {showDrawer && <AdminNavBarDrawer />}
    </Box>
  );
};

const AdminNavBarMainMenuItem = ({
  href,
  ...rest
}: BoxProps & { href: string }) => {
  const { rtlValue } = useRtl();
  const { navDrawer } = useAdminLayoutContext();
  const pathname = usePathname() ?? '';
  const isActive =
    href === '/'
      ? pathname === (ADMIN_PATH || '/')
      : pathname.startsWith(`${ADMIN_PATH}${href}`);

  return (
    <Box
      as={LinkAdmin}
      href={href}
      bg="transparent"
      justifyContent="flex-start"
      position="relative"
      opacity={isActive ? 1 : 0.8}
      fontWeight="semibold"
      borderRadius="md"
      px="4"
      py="2"
      _active={{ bg: 'gray.700' }}
      _hover={{
        bg: 'gray.900',
        _after: {
          opacity: 1,
          w: '2rem',
        },
      }}
      _focusVisible={{
        outline: 'none',
        bg: 'gray.900',
        _after: {
          opacity: 1,
          w: '2rem',
        },
      }}
      _after={{
        opacity: isActive ? 1 : 0,
        content: '""',
        position: 'absolute',
        insetStart: { base: 8, md: '50%' },
        bottom: '0.2em',
        transform: rtlValue('translateX(-50%)', 'translateX(50%)'),
        transition: '0.2s',
        w: isActive ? '2rem' : 0,
        h: '2px',
        borderRadius: 'full',
        bg: 'currentColor',
      }}
      onClick={navDrawer.onClose}
      {...rest}
    />
  );
};

const AdminNavBarDrawerButton = (props: Partial<IconButtonProps>) => {
  const { navDrawer } = useAdminLayoutContext();

  return (
    <IconButton
      aria-label="Navigation"
      icon={<LuMenu size="1.5em" />}
      onClick={navDrawer.onOpen}
      variant="unstyled"
      _active={{ bg: 'gray.700' }}
      _hover={{ bg: 'gray.900' }}
      {...props}
    />
  );
};

const AdminNavBarDrawer = ({ ...rest }) => {
  const { navDrawer } = useAdminLayoutContext();
  const { rtlValue } = useRtl();
  return (
    <Drawer
      isOpen={navDrawer.isOpen ?? false}
      placement={rtlValue('left', 'right')}
      onClose={navDrawer.onClose ?? (() => undefined)}
      {...rest}
    >
      <DrawerOverlay>
        <DrawerContent
          bg="gray.800"
          color="white"
          pt="safe-top"
          pb="safe-bottom"
        >
          <DrawerCloseButton mt="safe-top" />
          <DrawerHeader>
            <Logo />
          </DrawerHeader>
          <DrawerBody p="2">
            <AdminNavBarMainMenu direction="column" />
          </DrawerBody>
        </DrawerContent>
      </DrawerOverlay>
    </Drawer>
  );
};

const AdminNavBarAccountMenuVersion = ({ ...rest }) => {
  const { t } = useTranslation(['admin']);

  const { hasCopied, onCopy } = useClipboard(
    JSON.stringify(buildInfo, null, 2)
  );

  if (!buildInfo?.version) {
    return null;
  }

  return (
    <>
      <MenuDivider />
      <Flex
        role="group"
        as="button"
        position="relative"
        w="full"
        textAlign="left"
        py="2"
        px="3"
        my="-2"
        fontSize="0.7rem"
        fontWeight="medium"
        outline="none"
        color="text-dimmed"
        _hover={{ bg: 'gray.50' }}
        _focusVisible={{ bg: 'gray.50' }}
        _dark={{
          _focusVisible: { bg: 'gray.800' },
          _hover: { bg: 'gray.600' },
        }}
        onClick={onCopy}
        {...rest}
      >
        <Flex
          display={hasCopied ? 'flex' : 'none'}
          position="absolute"
          align="center"
          top="0"
          insetStart="0"
          insetEnd="0"
          bottom="0"
          py="2"
          px="3"
          fontWeight="bold"
          bg="gray.50"
          color={hasCopied ? 'success.500' : undefined}
          _dark={{
            bg: 'gray.800',
            color: hasCopied ? 'success.300' : undefined,
          }}
          transition="0.2s"
          _groupHover={{ d: 'flex' }}
        >
          <Icon icon={hasCopied ? LuCheck : LuCopy} me="2" fontSize="sm" />
          {hasCopied
            ? t('admin:layout.accountMenu.version.copied')
            : t('admin:layout.accountMenu.version.copy')}
        </Flex>
        <Text as="span" noOfLines={2}>
          {t('admin:layout.accountMenu.version.label')}{' '}
          <strong>{buildInfo?.display ?? buildInfo?.version}</strong>
        </Text>
      </Flex>
    </>
  );
};
