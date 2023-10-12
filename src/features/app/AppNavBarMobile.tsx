import React from 'react';

import { Box, BoxProps, Flex, HStack } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
        <HStack w="full">
          <AppNavBarMobileMainMenuItem to={APP_PATH || '/'}>
            Home {/* TODO translations */}
          </AppNavBarMobileMainMenuItem>
          <AppNavBarMobileMainMenuItem to={`${APP_PATH}/account`}>
            Account {/* TODO translations */}
          </AppNavBarMobileMainMenuItem>
        </HStack>
      </Flex>
    </Box>
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
