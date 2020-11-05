import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Flex, Wrap, WrapItem, Button, SlideFade } from '@chakra-ui/core';
import { FiLogOut } from 'react-icons/fi';

const NavbarItem = (props) => (
  <WrapItem>
    <Button
      as={RouterLink}
      variant="ghost"
      _active={{ bg: 'gray.700' }}
      _hover={{ bg: 'gray.900' }}
      {...props}
    />
  </WrapItem>
);

export const Navbar = () => {
  const navbarHeight = '4rem';
  return (
    <>
      <SlideFade in offsetY={-40} style={{ zIndex: 2 }}>
        <Flex
          position="fixed"
          top="0"
          left="0"
          right="0"
          bg="gray.800"
          color="gray.50"
          align="center"
          px="6"
          h={navbarHeight}
        >
          <Box w="8rem" h="0.5rem" bg="gray.600" />
          <Wrap ml="auto" spacing="4">
            <NavbarItem to="/dashboard">Dashboard</NavbarItem>
            <NavbarItem to="/entity">Entity</NavbarItem>
            <NavbarItem to="/logout" rightIcon={<FiLogOut />}>
              Logout
            </NavbarItem>
          </Wrap>
        </Flex>
      </SlideFade>
      <Box h={navbarHeight} />
    </>
  );
};
