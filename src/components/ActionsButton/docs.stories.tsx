import React from 'react';

import {
  Box,
  Flex,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import { StoryFn } from '@storybook/react';
import { LuCopy, LuEdit, LuTrash2, LuUserPlus } from 'react-icons/lu';

import { Icon } from '@/components/Icons';

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

export const UsageWithMenu = () => (
  <Menu isLazy placement="left-start">
    <MenuButton as={ActionsButton} />
    <MenuList>
      <MenuItem icon={<Icon icon={LuEdit} fontSize="lg" color="gray.400" />}>
        Edit
      </MenuItem>
      <MenuItem icon={<Icon icon={LuCopy} fontSize="lg" color="gray.400" />}>
        Duplicate
      </MenuItem>
      <MenuItem
        icon={<Icon icon={LuUserPlus} fontSize="lg" color="gray.400" />}
      >
        Share
      </MenuItem>
      <MenuDivider />
      <MenuItem icon={<Icon icon={LuTrash2} fontSize="lg" color="gray.400" />}>
        Delete
      </MenuItem>
    </MenuList>
  </Menu>
);
UsageWithMenu.decorators = [
  (Story: StoryFn) => (
    <Flex h="12rem" justify="flex-end">
      <Story />
    </Flex>
  ),
];
