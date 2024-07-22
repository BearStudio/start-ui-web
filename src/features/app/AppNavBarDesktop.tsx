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
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { LuFolderGit2, LuHome } from 'react-icons/lu';

import { Icon } from '@/components/Icons';
import { Logo } from '@/components/Logo';
import { ROUTES_ACCOUNT } from '@/features/account/routes';
import { ROUTES_APP } from '@/features/app/routes';
import { ROUTES_REPOSITORIES } from '@/features/repositories/routes';
import { trpc } from '@/lib/trpc/client';

export const AppNavBarDesktop = (props: BoxProps) => {
  const { t } = useTranslation(['app']);
  const account = trpc.account.get.useQuery();
  const pathname = usePathname();
  const isAccountActive = pathname.startsWith(ROUTES_ACCOUNT.app.root());

  return (
    <Box display={{ base: 'none', md: 'block' }} {...props}>
      <Box w="full" h="0" pb="safe-top" />
      <Flex align="center" pt={6} pb={2}>
        <Container maxW="container.md">
          <HStack spacing={4}>
            <Box as={Link} href="/">
              <Logo />
            </Box>
            <HStack flex={1} spacing={0}>
              <AppNavBarDesktopMainMenuItem
                href={ROUTES_APP.root()}
                isExact
                icon={LuHome}
              >
                {t('app:layout.mainMenu.home')}
              </AppNavBarDesktopMainMenuItem>
              <AppNavBarDesktopMainMenuItem
                href={ROUTES_REPOSITORIES.app.root()}
                icon={LuFolderGit2}
              >
                {t('app:layout.mainMenu.repositories')}
              </AppNavBarDesktopMainMenuItem>
            </HStack>
            <Avatar
              as={Link}
              href={ROUTES_ACCOUNT.app.root()}
              size="sm"
              icon={<></>}
              name={account.data?.name ?? account.data?.email ?? ''}
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
  isExact,
}: {
  children: ReactNode;
  href: string;
  isExact?: boolean;
  icon?: React.FC;
}) => {
  const pathname = usePathname() ?? '';
  const isActive = isExact ? pathname === href : pathname.startsWith(href);

  return (
    <Flex
      as={Link}
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
