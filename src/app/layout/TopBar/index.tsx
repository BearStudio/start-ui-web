import React from 'react';

import {
  Box,
  Flex,
  SlideFade,
  IconButton,
  useTheme,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';

import { AccountMenu, MainMenu, useLayoutContext } from '@/app/layout';
import { NavDrawer } from '@/app/layout/NavDrawer';
import { Logo } from '@/components';
import { useDarkMode } from '@/hooks/useDarkMode';

const MenuButton = (props) => {
  const { navOnOpen } = useLayoutContext();
  return (
    <IconButton
      aria-label="Navigation"
      icon={<FiMenu size="1.5em" />}
      onClick={navOnOpen}
      bg="transparent"
      _active={{ bg: 'gray.700' }}
      _hover={{ bg: 'gray.900' }}
      {...props}
    />
  );
};

export const TopBar = () => {
  const theme = useTheme();
  const { colorModeValue } = useDarkMode();
  const showDrawer = useBreakpointValue({
    base: true,
    [theme.layout.breakpoints.desktop]: false,
  });

  return (
    <>
      <SlideFade in offsetY={-40} style={{ zIndex: 2 }}>
        <Flex
          position="fixed"
          top="0"
          insetStart="0"
          insetEnd="0"
          bg={colorModeValue('gray.800', 'gray.900')}
          color="gray.50"
          align="center"
          pt="safe-top"
          px="4"
          h={theme.layout.topBar.height}
        >
          <MenuButton display={{ base: 'flex', md: 'none' }} ms="-0.5rem" />
          <Box
            as={RouterLink}
            to="/"
            mx={{ base: 'auto', [theme.layout.breakpoints.desktop]: 0 }}
          >
            <Logo color="gray.500" h="1rem" />
          </Box>
          <MainMenu me="auto" ms="4" display={{ base: 'none', md: 'flex' }} />
          <AccountMenu />
        </Flex>
      </SlideFade>
      <Box h={theme.layout.topBar.height} />
      {showDrawer && <NavDrawer />}
    </>
  );
};
