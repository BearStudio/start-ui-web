import React from 'react';

import {
  Avatar,
  Box,
  BoxProps,
  Flex,
  IconButton,
  IconButtonProps,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  Spinner,
  Stack,
  Text,
  useBreakpointValue,
  useClipboard,
  useColorMode,
  useTheme,
} from '@chakra-ui/react';
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  LuBookOpen,
  LuCheck,
  LuCopy,
  LuLogOut,
  LuMenu,
  LuMoon,
  LuSun,
  LuUser,
} from 'react-icons/lu';

import { Icon } from '@/components/Icons';
import { Logo } from '@/components/Logo';
import { useLayoutContext } from '@/features/layout/Layout';
import { useRtl } from '@/hooks/useRtl';
import { trpc } from '@/lib/trpc/client';

import buildInfo from '../../../scripts/.build-info.json';

const TopBarMainMenu = ({ ...rest }) => {
  const { t } = useTranslation(['layout']);
  const account = trpc.account.get.useQuery();
  return (
    <Stack direction="row" spacing="1" {...rest}>
      <TopBarMainMenuItem to="/dashboard">
        {t('layout:mainMenu.dashboard')}
      </TopBarMainMenuItem>
      <TopBarMainMenuItem to="/repositories">
        {t('layout:mainMenu.repositories')}
      </TopBarMainMenuItem>
      {account.data?.role === 'ADMIN' && (
        <TopBarMainMenuItem to="/management">
          {t('layout:mainMenu.management')}
        </TopBarMainMenuItem>
      )}
    </Stack>
  );
};

const TopBarAccountMenu = ({ ...rest }) => {
  const { t } = useTranslation(['layout']);

  const { colorMode, toggleColorMode } = useColorMode();
  const account = trpc.account.get.useQuery();
  const router = useRouter();

  return (
    <Box color="gray.800" _dark={{ color: 'white' }}>
      <Menu placement="bottom-end" {...rest}>
        <MenuButton borderRadius="full" _focusVisible={{ shadow: 'outline' }}>
          <Avatar size="sm" icon={<></>} name={account.data?.email ?? ''}>
            {account.isLoading && <Spinner size="xs" />}
          </Avatar>
        </MenuButton>
        <MenuList maxW="12rem" overflow="hidden">
          <MenuGroup title={account.data?.email ?? ''} noOfLines={1}>
            <MenuItem
              as={Link}
              href="/account"
              icon={<Icon icon={LuUser} fontSize="lg" color="gray.400" />}
            >
              {t('layout:accountMenu.myAccount')}
            </MenuItem>

            {account.data?.role === 'ADMIN' && (
              <MenuItem
                as={Link}
                href="/docs/api"
                icon={<Icon icon={LuBookOpen} fontSize="lg" color="gray.400" />}
              >
                Api Documentation
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
              ? t('layout:accountMenu.switchColorModeLight')
              : t('layout:accountMenu.switchColorModeDark')}
          </MenuItem>
          <MenuDivider />
          <MenuItem
            icon={<Icon icon={LuLogOut} fontSize="lg" color="gray.400" />}
            onClick={() => router.push('/logout')}
          >
            {t('layout:accountMenu.logout')}
          </MenuItem>
          <TopBarAccountMenuVersion />
        </MenuList>
      </Menu>
    </Box>
  );
};

export const TopBar = () => {
  const theme = useTheme();

  const showDrawer = useBreakpointValue({
    base: true,
    [theme.layout.breakpoints.desktop]: false,
  });

  return (
    <>
      <Flex
        zIndex="sticky"
        position="fixed"
        top="0"
        insetStart="0"
        insetEnd="0"
        color="gray.50"
        align="center"
        pt="safe-top"
        px="4"
        h={theme.layout.topBar.height}
        bg="gray.800"
        boxShadow="layout"
        _dark={{
          bg: 'gray.900',
          boxShadow: 'xl',
        }}
      >
        <TopBarDrawerButton
          display={{ base: 'flex', md: 'none' }}
          ms="-0.5rem"
        />
        <Box
          as={Link}
          href="/"
          mx={{ base: 'auto', [theme.layout.breakpoints.desktop]: 0 }}
        >
          <Logo />
        </Box>
        <TopBarMainMenu
          me="auto"
          ms="4"
          display={{ base: 'none', md: 'flex' }}
        />
        <TopBarAccountMenu />
      </Flex>
      <Box h={theme.layout.topBar.height} />
      {showDrawer && <TopBarDrawer />}
    </>
  );
};

const TopBarMainMenuItem = ({ to, ...rest }: BoxProps & { to: string }) => {
  const { rtlValue } = useRtl();
  const { navOnClose } = useLayoutContext();
  const pathname = usePathname() ?? '';
  const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);
  return (
    <Box
      as={Link}
      href={to}
      bg="transparent"
      justifyContent="flex-start"
      position="relative"
      opacity={isActive ? 1 : 0.8}
      fontWeight="bold"
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
      onClick={navOnClose}
      {...rest}
    />
  );
};

const TopBarDrawerButton = (props: Partial<IconButtonProps>) => {
  const { navOnOpen } = useLayoutContext();

  return (
    <IconButton
      aria-label="Navigation"
      icon={<LuMenu size="1.5em" />}
      onClick={navOnOpen}
      variant="unstyled"
      _active={{ bg: 'gray.700' }}
      _hover={{ bg: 'gray.900' }}
      {...props}
    />
  );
};

const TopBarDrawer = ({ ...rest }) => {
  const { navIsOpen, navOnClose } = useLayoutContext();
  const { rtlValue } = useRtl();
  return (
    <Drawer
      isOpen={navIsOpen}
      placement={rtlValue('left', 'right')}
      onClose={() => navOnClose?.()}
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
            <TopBarMainMenu direction="column" />
          </DrawerBody>
        </DrawerContent>
      </DrawerOverlay>
    </Drawer>
  );
};

const TopBarAccountMenuVersion = ({ ...rest }) => {
  const { t } = useTranslation(['layout']);

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
        color="gray.500"
        _hover={{ bg: 'gray.50' }}
        _focusVisible={{ bg: 'gray.50' }}
        _dark={{
          color: 'gray.200',
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
            ? t('layout:accountMenu.version.copied')
            : t('layout:accountMenu.version.copy')}
        </Flex>
        <Text as="span" noOfLines={2}>
          {t('layout:accountMenu.version.label')}{' '}
          <strong>{buildInfo?.display ?? buildInfo?.version}</strong>
        </Text>
      </Flex>
    </>
  );
};
