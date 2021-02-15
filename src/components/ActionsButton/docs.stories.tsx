import React from 'react';

import {
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuDivider,
  MenuItem,
  Box,
} from '@chakra-ui/react';
import { FiEdit, FiCopy, FiUserPlus, FiTrash2 } from 'react-icons/fi';

import { Icon } from '@/components';

import { ActionsButton } from './index';

export default {
  title: 'Components/ActionsButton',
};

export const Default = () => <ActionsButton />;

export const DarkBackground = () => (
  <Box p="4" color="white" bg="gray.800">
    <ActionsButton />
  </Box>
);
DarkBackground.parameters = {
  docs: {
    description: {
      story: 'some story **markdown**',
    },
  },
};

export const UsageWithMenu = () => (
  <Menu isLazy placement="left-start">
    <MenuButton as={ActionsButton} />
    <MenuList>
      <MenuItem icon={<Icon icon={FiEdit} fontSize="lg" color="gray.400" />}>
        Edit
      </MenuItem>
      <MenuItem icon={<Icon icon={FiCopy} fontSize="lg" color="gray.400" />}>
        Duplicate
      </MenuItem>
      <MenuItem
        icon={<Icon icon={FiUserPlus} fontSize="lg" color="gray.400" />}
      >
        Share
      </MenuItem>
      <MenuDivider />
      <MenuItem icon={<Icon icon={FiTrash2} fontSize="lg" color="gray.400" />}>
        Delete
      </MenuItem>
    </MenuList>
  </Menu>
);
UsageWithMenu.decorators = [
  (Story) => (
    <Flex h="12rem" justify="flex-end">
      <Story />
    </Flex>
  ),
];
