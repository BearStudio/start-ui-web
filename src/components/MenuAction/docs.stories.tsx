import React from 'react';

import {
  Icon,
  MenuDivider,
  MenuItem,
  MenuList,
  Portal,
  useDisclosure,
} from '@chakra-ui/react';
import { FiEdit, FiUserPlus, FiTrash2 } from 'react-icons/fi';

import { ActionsButton } from '@/components';
import { MenuAction, MenuActionItem } from '@/components';
import { useMenuAction } from '@/components/MenuAction/index';

export default {
  title: 'components/MenuItemAction',
  parameters: {
    docs: {
      description: {
        component: `The Menu Item action allow action when clicking on button`,
      },
    },
  },
};

export const Default = () => {
  const menuActions = {
    firstAction: {
      state: useDisclosure(),
      action: () => console.info('Fired firstAction'),
    },
    secondAction: {
      state: useDisclosure(),
      action: () => console.info('Fired secondAction'),
    },
  };

  const {
    callBackConfirmButton,
    onCloseMenu,
    onToggleMenu,
    isOpenMenu,
  }: any = useMenuAction(menuActions);

  const { firstAction, secondAction } = menuActions;

  return (
    <MenuAction
      isLazy
      ActionsButton={ActionsButton}
      isOpen={isOpenMenu}
      callBackCloseMenu={onCloseMenu}
      onToggle={onToggleMenu}
    >
      <Portal>
        <MenuList>
          <MenuItem icon={<Icon as={FiEdit} fontSize="lg" color="gray.400" />}>
            Menu item
          </MenuItem>
          <>
            <MenuDivider />
            <MenuActionItem
              propsActionHeader={{
                size: 'xs',
                mb: '2',
              }}
              menuAction={firstAction}
              propsConfirmButton={{
                text: 'Confirm',
                ml: 'auto',
                size: 'sm',
                colorScheme: 'red',
              }}
              propsCancelButton={{
                text: 'Cancel',
                size: 'sm',
                variant: 'link',
              }}
              confirmationText="Are your sure?"
              actionCallBack={() => {
                callBackConfirmButton('firstAction');
              }}
              text="First action"
              icon={<Icon as={FiUserPlus} fontSize="lg" color="gray.400" />}
            />
            <MenuDivider />
            <MenuActionItem
              propsActionHeader={{
                size: 'xs',
                mb: '2',
              }}
              menuAction={secondAction}
              propsConfirmButton={{
                text: 'Confirm',
                ml: 'auto',
                size: 'sm',
                colorScheme: 'red',
              }}
              propsCancelButton={{
                text: 'Cancel',
                size: 'sm',
                variant: 'link',
              }}
              confirmationText="Are your sure?"
              actionCallBack={() => {
                callBackConfirmButton('secondAction');
              }}
              text="Second action"
              icon={<Icon as={FiTrash2} fontSize="lg" color="gray.400" />}
            />
          </>
        </MenuList>
      </Portal>
    </MenuAction>
  );
};
