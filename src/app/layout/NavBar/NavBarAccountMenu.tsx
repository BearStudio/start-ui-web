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
} from '@chakra-ui/react';
import { FiLogOut, FiUser } from 'react-icons/fi';
import { useHistory } from 'react-router-dom';

import { useAccount } from '@/app/account/service';

export const NavBarAccountMenu = (props) => {
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
