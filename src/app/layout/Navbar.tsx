import React, { useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Stack,
  Button,
  SlideFade,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  IconButton,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuGroup,
  MenuDivider,
} from '@chakra-ui/core';
import { FiLogOut, FiMenu } from 'react-icons/fi';
import { useAccount } from '../account/service';

const NavbarContext = React.createContext(null);

const NavbarLogo = (props) => (
  <Box w="8rem" h="1rem" bg="gray.600" borderRadius="full" {...props} />
);

const NavbarItem = (props) => {
  const { onClose } = useContext(NavbarContext);
  return (
    <Button
      as={RouterLink}
      variant="ghost"
      justifyContent="flex-start"
      _active={{ bg: 'gray.700' }}
      _hover={{ bg: 'gray.900' }}
      onClick={onClose}
      {...props}
    />
  );
};

const NavbarMenu = (props) => (
  <Stack direction="row" spacing="1" {...props}>
    <NavbarItem to="/dashboard">Dashboard</NavbarItem>
    <NavbarItem to="/entity">Entity</NavbarItem>
  </Stack>
);

const NavbarMenuButton = (props) => {
  const { onOpen } = useContext(NavbarContext);
  return (
    <IconButton
      aria-label="Navigation"
      icon={<FiMenu />}
      onClick={onOpen}
      variant="ghost"
      _active={{ bg: 'gray.700' }}
      _hover={{ bg: 'gray.900' }}
      {...props}
    />
  );
};

const NavbarMenuDrawer = ({ children, ...rest }) => {
  const { isOpen, onClose } = useContext(NavbarContext);
  return (
    <Drawer isOpen={isOpen} placement="left" onClose={onClose} {...rest}>
      <DrawerOverlay>
        <DrawerContent bg="gray.800" color="gray.50">
          <DrawerCloseButton />
          <DrawerHeader>
            <NavbarLogo />
          </DrawerHeader>
          <DrawerBody p="2">{children}</DrawerBody>
        </DrawerContent>
      </DrawerOverlay>
    </Drawer>
  );
};

const NavbarAccountMenu = (props) => {
  const { data: account } = useAccount();
  const navigate = useNavigate();
  return (
    <Menu {...props}>
      <MenuButton
        as={Avatar}
        display="block"
        size="sm"
        name={`${account?.login}`}
      />
      <MenuList color="gray.800">
        <MenuGroup title={account?.email}>
          <MenuItem onClick={() => navigate('/account')}>My Account</MenuItem>
        </MenuGroup>
        <MenuDivider />
        <MenuItem icon={<FiLogOut />} onClick={() => navigate('/logout')}>
          Logout
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export const Navbar = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const navbarHeight = '4rem';

  return (
    <NavbarContext.Provider value={{ isOpen, onClose, onOpen }}>
      <SlideFade in offsetY={-40} style={{ zIndex: 2 }}>
        <Flex
          position="fixed"
          top="0"
          left="0"
          right="0"
          bg="gray.800"
          color="gray.50"
          align="center"
          px="4"
          h={navbarHeight}
        >
          <NavbarMenuButton
            display={{ base: 'flex', md: 'none' }}
            ml="-0.5rem"
          />
          <NavbarLogo mx={{ base: 'auto', md: '0' }} />
          <NavbarMenu ml="auto" mr="4" display={{ base: 'none', md: 'flex' }} />
          <NavbarAccountMenu />
        </Flex>
      </SlideFade>
      <Box h={navbarHeight} />
      <NavbarMenuDrawer>
        <NavbarMenu direction="column" />
      </NavbarMenuDrawer>
    </NavbarContext.Provider>
  );
};
