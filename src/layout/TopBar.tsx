import React from 'react';

import {
  Box,
  Flex,
  IconButton,
  IconButtonProps,
  useBreakpointValue,
  useTheme,
} from '@chakra-ui/react';
import Link from 'next/link';
import { LuMenu } from 'react-icons/lu';

import { Logo } from '@/components/Logo';
import { AccountMenu } from '@/layout/AccountMenu';
import { useLayoutContext } from '@/layout/LayoutContext';
import { MainMenu } from '@/layout/MainMenu';
import { NavDrawer } from '@/layout/NavDrawer';

const MenuButton = (props: Partial<IconButtonProps>) => {
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
        <MenuButton display={{ base: 'flex', md: 'none' }} ms="-0.5rem" />
        <Box
          as={Link}
          href="/"
          mx={{ base: 'auto', [theme.layout.breakpoints.desktop]: 0 }}
        >
          <Logo />
        </Box>
        <MainMenu me="auto" ms="4" display={{ base: 'none', md: 'flex' }} />
        <AccountMenu />
      </Flex>
      <Box h={theme.layout.topBar.height} />
      {showDrawer && <NavDrawer />}
    </>
  );
};
