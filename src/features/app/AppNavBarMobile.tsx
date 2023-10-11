import React from 'react';

import { Box, BoxProps, Container, Flex, HStack } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { APP_PATH } from '@/features/app/constants';

const HEIGHT = '60px';

export const AppNavBarMobile = () => {
  return (
    <>
      <Box h={HEIGHT} />
      <Flex
        align="center"
        pt="safe-bottom"
        position="fixed"
        bottom={0}
        insetStart={0}
        insetEnd={0}
        display={{ base: 'flex', md: 'none' }}
        bg="white"
        color="gray.800"
        _dark={{
          bg: 'gray.900',
          color: 'white',
        }}
        boxShadow="layout"
        h={HEIGHT}
      >
        <Container>
          <HStack>
            <AppNavBarMobileMainMenuItem to={APP_PATH || '/'}>
              Home {/* TODO translations */}
            </AppNavBarMobileMainMenuItem>
            <AppNavBarMobileMainMenuItem to={`${APP_PATH}/account`}>
              Account {/* TODO translations */}
            </AppNavBarMobileMainMenuItem>
          </HStack>
        </Container>
      </Flex>
    </>
  );
};

const AppNavBarMobileMainMenuItem = ({
  to,
  ...rest
}: BoxProps & { to: string }) => {
  const pathname = usePathname() ?? '';
  const isActive =
    to === (APP_PATH || '/')
      ? pathname === (APP_PATH || '/')
      : pathname.startsWith(to);

  console.log({ isActive, to, pathname });
  return (
    <Flex
      as={Link}
      href={to}
      bg="transparent"
      justifyContent="center"
      position="relative"
      fontWeight="medium"
      alignItems="center"
      opacity={isActive ? 1 : 0.6}
      flex={1}
      {...rest}
    />
  );
};
