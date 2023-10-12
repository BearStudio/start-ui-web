import React, { ReactNode } from 'react';

import { Box, BoxProps, Container, Flex } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LuHome, LuUser } from 'react-icons/lu';

import { Icon } from '@/components/Icons';
import { APP_PATH } from '@/features/app/constants';

const HEIGHT = '60px';

export const AppNavBarMobile = (props: BoxProps) => {
  return (
    <Box display={{ base: 'block', md: 'none' }} {...props}>
      <Box h={HEIGHT} />
      <Flex
        zIndex={3}
        align="center"
        pt="safe-bottom"
        position="fixed"
        direction="column"
        bottom={0}
        insetStart={0}
        insetEnd={0}
        bg="white"
        color="gray.800"
        _dark={{
          bg: 'gray.900',
          color: 'white',
        }}
        boxShadow="layout"
        h={HEIGHT}
      >
        <Container display="flex" flexDirection="row" w="full" flex={1}>
          <AppNavBarMobileMainMenuItem icon={LuHome} href={APP_PATH || '/'}>
            Home {/* TODO translations */}
          </AppNavBarMobileMainMenuItem>
          <AppNavBarMobileMainMenuItem
            icon={LuUser}
            href={`${APP_PATH}/account`}
          >
            Account {/* TODO translations */}
          </AppNavBarMobileMainMenuItem>
        </Container>
      </Flex>
    </Box>
  );
};

const AppNavBarMobileMainMenuItem = ({
  href,
  children,
  icon,
}: {
  children: ReactNode;
  href: string;
  icon: React.FC;
}) => {
  const pathname = usePathname() ?? '';
  const isActive =
    href === (APP_PATH || '/')
      ? pathname === (APP_PATH || '/')
      : pathname.startsWith(href);

  return (
    <Flex
      as={Link}
      href={href}
      direction="column"
      justifyContent="center"
      position="relative"
      fontWeight="medium"
      alignItems="center"
      opacity={isActive ? 1 : 0.6}
      flex={1}
    >
      <Icon fontSize="2xl" icon={icon} />
      <Box fontSize="xs" opacity={isActive ? 1 : 0.8} mt={-1.5}>
        {children}
      </Box>
    </Flex>
  );
};
