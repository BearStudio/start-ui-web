import React from 'react';

import {
  Badge,
  Box,
  Button,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
} from '@chakra-ui/react';
import { LuActivity, LuChevronDown, LuTrash2 } from 'react-icons/lu';

import { Icon } from '@/components/Icons';

import { ConfirmMenuItem } from './';

export default {
  title: 'Components/ConfirmMenuItem',
};

export const Default = () => {
  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<Icon icon={LuChevronDown} />}>
        Actions
      </MenuButton>
      <Portal>
        <MenuList>
          <MenuItem>Action</MenuItem>
          <ConfirmMenuItem
            onClick={() => {
              alert('Action');
            }}
          >
            Confirm Action
          </ConfirmMenuItem>
          <MenuItem>Action</MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};

export const MenuItemLongText = () => {
  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<Icon icon={LuChevronDown} />}>
        Actions
      </MenuButton>
      <Portal>
        <MenuList>
          <MenuItem>Action</MenuItem>
          <ConfirmMenuItem>
            Confirm Action with long texts, lorem ipsum dolor sit amet,
            consectetur adipiscing elit. Nunc sed pellentesque lorem, id dictum
            odio.
          </ConfirmMenuItem>
          <MenuItem>Action</MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};

export const ConfirmText = () => {
  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<Icon icon={LuChevronDown} />}>
        Actions
      </MenuButton>
      <Portal>
        <MenuList>
          <MenuItem>Action</MenuItem>
          <ConfirmMenuItem confirmText="Custom Confirm">
            Confirm Action
          </ConfirmMenuItem>
          <MenuItem>Action</MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};

export const ConfirmTextLong = () => {
  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<Icon icon={LuChevronDown} />}>
        Actions
      </MenuButton>
      <Portal>
        <MenuList>
          <MenuItem>Action</MenuItem>
          <ConfirmMenuItem
            confirmText="Confirm with long texts, lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc sed
            pellentesque lorem, id dictum odio."
          >
            Confirm Action
          </ConfirmMenuItem>
          <MenuItem>Action</MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};

export const ConfirmMenuItemIcon = () => {
  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<Icon icon={LuChevronDown} />}>
        Actions
      </MenuButton>
      <Portal>
        <MenuList>
          <MenuItem>Action</MenuItem>
          <ConfirmMenuItem
            icon={<Icon icon={LuTrash2} fontSize="lg" color="gray.400" />}
          >
            Confirm Action
          </ConfirmMenuItem>
          <MenuItem>Action</MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};

export const ConfirmIcon = () => {
  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<Icon icon={LuChevronDown} />}>
        Actions
      </MenuButton>
      <Portal>
        <MenuList>
          <MenuItem>Action</MenuItem>
          <ConfirmMenuItem confirmIcon={LuActivity}>
            Confirm Action
          </ConfirmMenuItem>
          <MenuItem>Action</MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};

export const ConfirmContent = () => {
  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<Icon icon={LuChevronDown} />}>
        Actions
      </MenuButton>
      <Portal>
        <MenuList>
          <MenuItem>Action</MenuItem>
          <ConfirmMenuItem
            confirmContent={
              <HStack>
                <Box>Confirmation</Box>
                <Badge>Something</Badge>
              </HStack>
            }
          >
            Confirm Action
          </ConfirmMenuItem>
          <MenuItem>Action</MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};

export const ConfirmColorScheme = () => {
  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<Icon icon={LuChevronDown} />}>
        Actions
      </MenuButton>
      <Portal>
        <MenuList>
          <MenuItem>Action</MenuItem>
          <ConfirmMenuItem confirmColorScheme="green">
            Confirm Action
          </ConfirmMenuItem>
          <MenuItem>Action</MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};

export const ConfirmDelay = () => {
  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<Icon icon={LuChevronDown} />}>
        Actions
      </MenuButton>
      <Portal>
        <MenuList>
          <MenuItem>Action</MenuItem>
          <ConfirmMenuItem confirmDelay={5000}>Confirm Action</ConfirmMenuItem>
          <MenuItem>Action</MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};
