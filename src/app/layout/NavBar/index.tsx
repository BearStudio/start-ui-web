import React, { useContext } from 'react';

import {
  Box,
  Flex,
  SlideFade,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  IconButton,
  useTheme,
} from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';

import { NavBarAccountMenu } from './NavBarAccountMenu';
import { NavBarContext } from './NavBarContext';
import { NavBarMenu } from './NavBarMenu';

const NavBarLogo = (props) => (
  <Box w="8rem" h="1rem" bg="gray.600" borderRadius="full" {...props} />
);

const NavBarMenuButton = (props) => {
  const { onOpen } = useContext(NavBarContext);
  return (
    <IconButton
      aria-label="Navigation"
      icon={<FiMenu size="1.5em" />}
      onClick={onOpen}
      variant="ghost"
      _active={{ bg: 'gray.700' }}
      _hover={{ bg: 'gray.900' }}
      {...props}
    />
  );
};

const NavBarMenuDrawer = ({ children, ...rest }) => {
  const { isOpen, onClose } = useContext(NavBarContext);
  return (
    <Drawer isOpen={isOpen} placement="left" onClose={onClose} {...rest}>
      <DrawerOverlay>
        <DrawerContent
          bg="gray.800"
          color="gray.50"
          pt="safe-top"
          pb="safe-bottom"
        >
          <DrawerCloseButton mt="safe-top" />
          <DrawerHeader>
            <NavBarLogo />
          </DrawerHeader>
          <DrawerBody p="2">{children}</DrawerBody>
        </DrawerContent>
      </DrawerOverlay>
    </Drawer>
  );
};

export const NavBar = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const theme = useTheme();
  const navbarHeight = `calc(4rem + ${theme.space['safe-top']})`;

  return (
    <NavBarContext.Provider value={{ isOpen, onClose, onOpen }}>
      <SlideFade in offsetY={-40} style={{ zIndex: 2 }}>
        <Flex
          position="fixed"
          top="0"
          left="0"
          right="0"
          bg="gray.800"
          color="gray.50"
          align="center"
          pt="safe-top"
          px="4"
          h={navbarHeight}
        >
          <NavBarMenuButton
            display={{ base: 'flex', md: 'none' }}
            ml="-0.5rem"
          />
          <NavBarLogo mx={{ base: 'auto', md: '0' }} />
          <NavBarMenu mr="auto" ml="4" display={{ base: 'none', md: 'flex' }} />
          <NavBarAccountMenu />
        </Flex>
      </SlideFade>
      <Box h={navbarHeight} />
      <NavBarMenuDrawer>
        <NavBarMenu direction="column" />
      </NavBarMenuDrawer>
    </NavBarContext.Provider>
  );
};
