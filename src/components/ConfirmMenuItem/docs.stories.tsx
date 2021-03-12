import React from 'react';

import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
  Text,
} from '@chakra-ui/react';
import { FiChevronDown, FiAlertTriangle } from 'react-icons/fi';

import { Icon } from '@/components';

import { ConfirmMenuItem } from './';

export default {
  title: 'Components/ConfirmMenuItem',
};

export const Default = () => {
  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<Icon icon={FiChevronDown} />}>
        Actions
      </MenuButton>
      <Portal>
        <MenuList>
          <MenuItem>Download</MenuItem>
          <MenuItem>Create</MenuItem>
          <MenuItem>Mark</MenuItem>
          <ConfirmMenuItem>Delete</ConfirmMenuItem>
          <MenuItem>Attend</MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};

export const LongTextInMenuItem = () => {
  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<Icon icon={FiChevronDown} />}>
        Actions
      </MenuButton>
      <Portal>
        <MenuList>
          <MenuItem>Download</MenuItem>
          <MenuItem>Create</MenuItem>
          <MenuItem>Mark</MenuItem>
          <ConfirmMenuItem>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc sed
            pellentesque lorem, id dictum odio.
          </ConfirmMenuItem>
          <MenuItem>Attend</MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};

export const LongTextInConfirmText = () => {
  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<Icon icon={FiChevronDown} />}>
        Actions
      </MenuButton>
      <Portal>
        <MenuList>
          <MenuItem>Download</MenuItem>
          <MenuItem>Create</MenuItem>
          <MenuItem>Mark</MenuItem>
          <ConfirmMenuItem
            confirmText="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc sed
            pellentesque lorem, id dictum odio."
          >
            Delete
          </ConfirmMenuItem>
          <MenuItem>Attend</MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};

export const ConfirmAction = () => {
  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<Icon icon={FiChevronDown} />}>
        Actions
      </MenuButton>
      <Portal>
        <MenuList>
          <MenuItem>Download</MenuItem>
          <MenuItem>Create a Copy</MenuItem>
          <MenuItem>Mark as Draft</MenuItem>
          <ConfirmMenuItem
            onClick={() => {
              alert('Action');
            }}
          >
            Delete
          </ConfirmMenuItem>
          <MenuItem>Attend a Workshop</MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};

export const ConfirmColorScheme = () => {
  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<Icon icon={FiChevronDown} />}>
        Actions
      </MenuButton>
      <Portal>
        <MenuList>
          <MenuItem>Download</MenuItem>
          <MenuItem>Create a Copy</MenuItem>
          <MenuItem>Mark as Draft</MenuItem>
          <ConfirmMenuItem confirmColorScheme="green">Delete</ConfirmMenuItem>
          <MenuItem>Attend a Workshop</MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};

export const ConfirmContent = () => {
  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<Icon icon={FiChevronDown} />}>
        Actions
      </MenuButton>
      <Portal>
        <MenuList>
          <MenuItem>Download</MenuItem>
          <MenuItem>Create a Copy</MenuItem>
          <MenuItem>Mark as Draft</MenuItem>
          <ConfirmMenuItem
            confirmContent={
              <>
                <Icon icon={FiAlertTriangle} mr={1} />{' '}
                <Text>Confirmation content</Text>
              </>
            }
          >
            Delete
          </ConfirmMenuItem>
          <MenuItem>Attend a Workshop</MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};

export const ConfirmDelay = () => {
  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<Icon icon={FiChevronDown} />}>
        Actions
      </MenuButton>
      <Portal>
        <MenuList>
          <MenuItem>Download</MenuItem>
          <MenuItem>Create a Copy</MenuItem>
          <MenuItem>Mark as Draft</MenuItem>
          <ConfirmMenuItem confirmDelay={5000}>Delete</ConfirmMenuItem>
          <MenuItem>Attend a Workshop</MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};
