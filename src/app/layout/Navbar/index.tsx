import React, { useContext } from 'react';

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
  Spinner,
  useTheme,
  Icon,
} from '@chakra-ui/react';
import { FiLogOut, FiMenu, FiUser } from 'react-icons/fi';
import { Link as RouterLink, useLocation, useHistory } from 'react-router-dom';

import { useAccount } from '@/app/account/service';

const NavBarContext = React.createContext(null);

const NavBarLogo = (props) => (
  <Box w="8rem" h="1rem" bg="gray.600" borderRadius="full" {...props} />
);

const NavBarItem = ({ to, ...rest }: any) => {
  const { onClose } = useContext(NavBarContext);
  const { pathname } = useLocation();
  const isActive = pathname.startsWith(to);
  return (
    <Button
      as={RouterLink}
      to={to}
      variant="ghost"
      justifyContent="flex-start"
      position="relative"
      opacity={isActive ? 1 : 0.8}
      _active={{ bg: 'gray.700' }}
      _hover={{
        bg: 'gray.900',
        _after: {
          opacity: 1,
          w: '2rem',
        },
      }}
      _after={{
        opacity: isActive ? 1 : 0,
        content: '""',
        position: 'absolute',
        left: { base: 8, md: '50%' },
        bottom: '0.2em',
        transform: 'translateX(-50%)',
        transition: '0.2s',
        w: isActive ? '2rem' : 0,
        h: '2px',
        borderRadius: 'full',
        bg: 'currentColor',
      }}
      onClick={onClose}
      {...rest}
    />
  );
};

const NavBarMenu = (props) => {
  const { isAdmin } = useAccount();
  return (
    <Stack direction="row" spacing="1" {...props}>
      <NavBarItem to="/dashboard">Dashboard</NavBarItem>
      <NavBarItem to="/entity">Entity</NavBarItem>
      {isAdmin && <NavBarItem to="/admin">Admin</NavBarItem>}
    </Stack>
  );
};

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

const NavBarAccountMenu = (props) => {
  const { account, isLoading } = useAccount();
  const history = useHistory();

  return (
    <Menu {...props}>
      <MenuButton borderRadius="full" _focus={{ shadow: 'outline' }}>
        <Avatar size="sm" icon={<></>} name={!isLoading && `${account?.login}`}>
          {isLoading && <Spinner size="xs" />}
        </Avatar>
      </MenuButton>
      <MenuList color="gray.800">
        <MenuGroup title={account?.email}>
          <MenuItem
            icon={<Icon as={FiUser} fontSize="lg" color="gray.400" />}
            onClick={() => history.push('/account')}
          >
            My Account
          </MenuItem>
        </MenuGroup>
        <MenuDivider />
        <MenuItem
          icon={<Icon as={FiLogOut} fontSize="lg" color="gray.400" />}
          onClick={() => history.push('/logout')}
        >
          Logout
        </MenuItem>
      </MenuList>
    </Menu>
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
