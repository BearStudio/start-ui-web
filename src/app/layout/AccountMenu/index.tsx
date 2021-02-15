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
  Icon,
  Flex,
  Text,
  useClipboard,
} from '@chakra-ui/react';
import axios from 'axios';
import { FiCheck, FiCopy, FiLogOut, FiUser } from 'react-icons/fi';
import { useQuery } from 'react-query';
import { Link, useHistory } from 'react-router-dom';

import { useAccount } from '@/app/account/account.service';

const AppVersion = ({ ...rest }) => {
  const { data } = useQuery<any>(
    'appBuild',
    () => axios.get('/app-build.json', { baseURL: '/' }),
    { retry: 0, staleTime: Infinity }
  );
  const { hasCopied, onCopy } = useClipboard(data?.version);

  if (!data?.version) {
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
        bg="white"
        color="gray.400"
        outline="none"
        _hover={{ bg: 'gray.50', color: 'gray.500' }}
        _focus={{ bg: 'gray.50', color: 'gray.500' }}
        onClick={onCopy}
        {...rest}
      >
        <Flex
          d={hasCopied ? 'flex' : 'none'}
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          py="2"
          px="3"
          fontWeight="bold"
          bg="white"
          color={hasCopied ? 'success.500' : undefined}
          transition="0.2s"
          _groupHover={{ d: 'flex' }}
        >
          <Icon as={hasCopied ? FiCheck : FiCopy} mr="2" fontSize="sm" />
          {hasCopied ? 'Copied' : 'Copy version'}
        </Flex>
        <Text as="span" noOfLines={2}>
          Version <strong>{data?.version}</strong>
        </Text>
      </Flex>
    </>
  );
};

export const AccountMenu = ({ ...rest }) => {
  const { account, isLoading } = useAccount();
  const history = useHistory();

  return (
    <Menu {...rest}>
      <MenuButton borderRadius="full" _focus={{ shadow: 'outline' }}>
        <Avatar size="sm" icon={<></>} name={!isLoading && `${account?.login}`}>
          {isLoading && <Spinner size="xs" />}
        </Avatar>
      </MenuButton>
      <MenuList color="gray.800" maxW="12rem" overflow="hidden">
        <MenuGroup title={account?.email}>
          <MenuItem
            as={Link}
            to="/account"
            icon={<Icon as={FiUser} fontSize="lg" color="gray.400" />}
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
        <AppVersion />
      </MenuList>
    </Menu>
  );
};
