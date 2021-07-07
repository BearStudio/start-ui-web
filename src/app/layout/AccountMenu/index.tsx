import React from 'react';

import {
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuGroup,
  MenuDivider,
  Spinner,
  Flex,
  Text,
  useClipboard,
  useColorModeValue,
  useColorMode,
} from '@chakra-ui/react';
import {
  FiCheck,
  FiCopy,
  FiLogOut,
  FiMoon,
  FiSun,
  FiUser,
} from 'react-icons/fi';
import { Link, useHistory } from 'react-router-dom';

import appBuild from '@/../app-build.json';
import { useAccount } from '@/app/account/account.service';
import { Icon } from '@/components';

const AppVersion = ({ ...rest }) => {
  const bgColorHover = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.400', 'gray.200');
  const { hasCopied, onCopy } = useClipboard(JSON.stringify(appBuild, null, 2));

  if (!appBuild?.version) {
    return null;
  }

  return (
    <>
      <MenuDivider />
      <Flex
        role="group"
        as="button"
        position="relative"
        w="full"
        textAlign="left"
        py="2"
        px="3"
        my="-2"
        fontSize="0.7rem"
        fontWeight="medium"
        color={textColor}
        outline="none"
        _hover={{ bg: bgColorHover }}
        _focus={{ bg: bgColorHover }}
        onClick={onCopy}
        {...rest}
      >
        <Flex
          d={hasCopied ? 'flex' : 'none'}
          position="absolute"
          align="center"
          top="0"
          left="0"
          right="0"
          bottom="0"
          py="2"
          px="3"
          fontWeight="bold"
          bg={bgColorHover}
          color={hasCopied ? 'success.500' : undefined}
          transition="0.2s"
          _groupHover={{ d: 'flex' }}
        >
          <Icon icon={hasCopied ? FiCheck : FiCopy} mr="2" fontSize="sm" />
          {hasCopied ? 'Version copiée' : 'Copier la version'}
        </Flex>
        <Text as="span" noOfLines={2}>
          Version <strong>{appBuild?.display ?? appBuild?.version}</strong>
        </Text>
      </Flex>
    </>
  );
};

export const AccountMenu = ({ ...rest }) => {
  const textColor = useColorModeValue('gray.700', 'white');
  const { colorMode, toggleColorMode } = useColorMode();
  const { account, isLoading } = useAccount();
  const history = useHistory();

  return (
    <Menu placement="bottom-end" {...rest}>
      <MenuButton borderRadius="full" _focus={{ shadow: 'outline' }}>
        <Avatar size="sm" icon={<></>} name={!isLoading && `${account?.login}`}>
          {isLoading && <Spinner size="xs" />}
        </Avatar>
      </MenuButton>
      <MenuList color={textColor} maxW="12rem" overflow="hidden">
        <MenuGroup title={account?.email}>
          <MenuItem
            as={Link}
            to="/account"
            icon={<Icon icon={FiUser} fontSize="lg" color="gray.400" />}
          >
            My Account
          </MenuItem>
        </MenuGroup>
        <MenuDivider />
        <MenuItem
          icon={
            <Icon
              icon={colorMode === 'dark' ? FiSun : FiMoon}
              fontSize="lg"
              color="gray.400"
            />
          }
          onClick={() => toggleColorMode()}
        >
          Switch to {colorMode === 'dark' ? 'Light' : 'Dark'} mode
        </MenuItem>
        <MenuDivider />
        <MenuItem
          icon={<Icon icon={FiLogOut} fontSize="lg" color="gray.400" />}
          onClick={() => history.push('/logout')}
        >
          Logout
        </MenuItem>
        <AppVersion />
      </MenuList>
    </Menu>
  );
};
