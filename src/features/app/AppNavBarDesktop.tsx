import React, { ReactNode } from 'react';

import {
  Avatar,
  Box,
  BoxProps,
  Container,
  Flex,
  HStack,
  Spinner,
} from '@chakra-ui/react';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { LuFolderGit2, LuHome } from 'react-icons/lu';

import { Icon } from '@/components/Icons';
import { Logo } from '@/components/Logo';
import { LinkApp } from '@/features/app/LinkApp';
import { APP_PATH } from '@/features/app/constants';
import { trpc } from '@/lib/trpc/client';

export const AppNavBarDesktop = (props: BoxProps) => {
  const { t } = useTranslation(['app']);
  const account = trpc.account.get.useQuery();
  const pathname = usePathname();
  const isAccountActive = pathname.startsWith(`${APP_PATH}/account`);

  return (
    <Box display={{ base: 'none', md: 'block' }} {...props}>
      <Box w="full" h="0" pb="safe-top" />
      <Flex align="center" pt={6} pb={2}>
        <Container maxW="container.md">
          <HStack spacing={4}>
            <Box as={LinkApp} href="/">
              <Logo />
            </Box>
            <HStack flex={1} spacing={0}>
              <AppNavBarDesktopMainMenuItem href="/" icon={LuHome}>
                {t('app:layout.mainMenu.home')}
              </AppNavBarDesktopMainMenuItem>
              <AppNavBarDesktopMainMenuItem
                href="/repositories"
                icon={LuFolderGit2}
              >
                {t('app:layout.mainMenu.repositories')}
              </AppNavBarDesktopMainMenuItem>
            </HStack>
            <Avatar
              data-testid="avatar-account"
              as={LinkApp}
              href="/account"
              size="sm"
              src={account.data?.image ?? undefined}
              name={account.data?.email ?? ''}
              {...(isAccountActive
                ? {
                    ring: '2px',
                    ringOffset: '3px',
                    ringColor: 'gray.800',
                    ringOffsetColor: 'white',
                    _dark: {
                      ringColor: 'gray.200',
                      ringOffsetColor: 'black',
                    },
                  }
                : {})}
            >
              {account.isLoading && <Spinner size="xs" />}
            </Avatar>
          </HStack>
        </Container>
      </Flex>
    </Box>
  );
};

const AppNavBarDesktopMainMenuItem = ({
  children,
  href,
  icon,
}: {
  children: ReactNode;
  href: string;
  icon?: React.FC;
}) => {
  const pathname = usePathname() ?? '';
  const isActive =
    href === '/'
      ? pathname === (APP_PATH || '/')
      : pathname.startsWith(`${APP_PATH}${href}`);

  return (
    <Flex
      as={LinkApp}
      href={href}
      bg="transparent"
      justifyContent="flex-start"
      position="relative"
      opacity={isActive ? 1 : 0.6}
      fontWeight="semibold"
      borderRadius="md"
      px={3}
      py={1.5}
      gap={1.5}
      transition="0.2s"
      _hover={{
        bg: 'gray.200',
      }}
      _dark={{
        _hover: {
          bg: 'gray.800',
        },
      }}
    >
      {!!icon && <Icon fontSize="0.9em" icon={icon} />}
      {children}
    </Flex>
  );
};
