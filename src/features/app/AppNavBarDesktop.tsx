import React from 'react';

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

import { Logo } from '@/components/Logo';
import { APP_PATH } from '@/features/app/constants';
import { trpc } from '@/lib/trpc/client';

export const AppNavBarDesktop = (props: BoxProps) => {
  const account = trpc.account.get.useQuery();

  return (
    <Box display={{ base: 'none', md: 'block' }} {...props}>
      <Box w="full" h="0" pb="safe-top" />
      <Flex align="center" pt={6} pb={2}>
        <Container>
          <HStack spacing={4}>
            <Box as={Link} href={APP_PATH || '/'}>
              <Logo />
            </Box>
            <HStack flex={1}>
              <AppNavBarDesktopMainMenuItem to={APP_PATH || '/'}>
                Home {/* TODO translations */}
              </AppNavBarDesktopMainMenuItem>
            </HStack>
            <Avatar
              as={Link}
              href={`${APP_PATH}/account`}
              size="sm"
              icon={<></>}
              name={account.data?.email ?? ''}
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
  to,
  ...rest
}: BoxProps & { to: string }) => {
  const pathname = usePathname() ?? '';
  const isActive =
    to === (APP_PATH || '/')
      ? pathname === (APP_PATH || '/')
      : pathname.startsWith(to);

  return (
    <Box
      as={Link}
      href={to}
      bg="transparent"
      justifyContent="flex-start"
      position="relative"
      opacity={isActive ? 1 : 0.6}
      fontWeight="medium"
      borderRadius="md"
      px={3}
      py={1.5}
      _hover={{
        bg: 'gray.200',
      }}
      _dark={{
        _hover: {
          bg: 'gray.800',
        },
      }}
      {...rest}
    />
  );
};
