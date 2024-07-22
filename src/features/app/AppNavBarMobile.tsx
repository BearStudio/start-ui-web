import React, { ReactNode } from 'react';

import { Box, BoxProps, Container, Flex } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { LuFolderGit2, LuHome, LuUser } from 'react-icons/lu';

import { Icon } from '@/components/Icons';
import { ROUTES_ACCOUNT } from '@/features/account/routes';
import { ROUTES_APP } from '@/features/app/routes';
import { ROUTES_REPOSITORIES } from '@/features/repositories/routes';

const HEIGHT = 'calc(60px + env(safe-area-inset-bottom))';

export const AppNavBarMobile = (props: BoxProps) => {
  const { t } = useTranslation(['app']);
  return (
    <Box display={{ base: 'block', md: 'none' }} {...props}>
      <Box h={HEIGHT} />
      <Flex
        zIndex={3}
        align="center"
        pb="safe-bottom"
        position="fixed"
        direction="column"
        bottom={0}
        insetStart={0}
        insetEnd={0}
        bg="white"
        color="gray.800"
        borderTop="1px solid transparent"
        boxShadow="layout"
        _dark={{
          bg: 'gray.900',
          color: 'white',
          borderTopColor: 'gray.800',
          boxShadow: 'dark-lg',
        }}
        h={HEIGHT}
      >
        <Container display="flex" flexDirection="row" w="full" flex={1}>
          <AppNavBarMobileMainMenuItem
            icon={LuHome}
            href={ROUTES_APP.root()}
            isExact
          >
            {t('app:layout.mainMenu.home')}
          </AppNavBarMobileMainMenuItem>
          <AppNavBarMobileMainMenuItem
            href={ROUTES_REPOSITORIES.app.root()}
            icon={LuFolderGit2}
          >
            {t('app:layout.mainMenu.repositories')}
          </AppNavBarMobileMainMenuItem>
          <AppNavBarMobileMainMenuItem
            icon={LuUser}
            href={ROUTES_ACCOUNT.app.root()}
          >
            {t('app:layout.mainMenu.account')}
          </AppNavBarMobileMainMenuItem>
        </Container>
      </Flex>
    </Box>
  );
};

const AppNavBarMobileMainMenuItem = ({
  href,
  isExact,
  children,
  icon,
}: {
  children: ReactNode;
  isExact?: boolean;
  href: string;
  icon: React.FC;
}) => {
  const pathname = usePathname() ?? '';
  const isActive = isExact ? pathname === href : pathname.startsWith(href);

  return (
    <Flex
      as={Link}
      href={href}
      direction="column"
      justifyContent="center"
      position="relative"
      fontWeight="medium"
      alignItems="center"
      opacity={isActive ? 1 : 0.4}
      transition="0.2s"
      pb={1}
      flex={1}
    >
      <Icon fontSize="2xl" icon={icon} />
      <Box fontSize="2xs" opacity={isActive ? 1 : 0.8} mt={-1.5}>
        {children}
      </Box>
    </Flex>
  );
};
