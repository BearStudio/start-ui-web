import React, { FC, useImperativeHandle } from 'react';

import {
  forwardRef,
  Box,
  MenuProps,
  useDisclosure,
  Menu,
  MenuButton,
} from '@chakra-ui/react';

import { ActionsButton } from '@/components';

export interface MenuActionProps extends MenuProps {}

export const useMenuAction = (menuActions) => {
  const {
    isOpen: isOpenMenu,
    onToggle: onToggleMenu,
    onClose,
  } = useDisclosure();

  const callBackConfirmButton = (element: string) => {
    onClose();
    menuActions[element]?.action();
    menuActions[element]?.state?.onClose();
  };

  const onCloseMenu = () => {
    onClose();
    Object.values(menuActions || []).map((menuItemElement: any) => {
      menuItemElement?.state?.onClose();
    });
  };

  return [
    menuActions,
    callBackConfirmButton,
    onCloseMenu,
    onToggleMenu,
    isOpenMenu,
  ];
};

export const MenuAction: FC<any> = forwardRef(
  (
    {
      children,
      ActionsButton,
      isActionsLoading,
      callBackCloseMenu,
      isOpen,
      onToggle,
      ...rest
    },
    ref: any
  ) => {
    return (
      <Menu
        placement="left-start"
        isOpen={isOpen}
        onClose={callBackCloseMenu}
        closeOnSelect={false}
        {...rest}
      >
        <MenuButton
          as={ActionsButton}
          isLoading={isActionsLoading}
          onClick={onToggle}
        />
        {children}
      </Menu>
    );
  }
);
