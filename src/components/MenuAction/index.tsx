import React, { FC } from 'react';

import { MenuProps, useDisclosure, Menu, MenuButton } from '@chakra-ui/react';

export interface MenuActionProps extends MenuProps {}

export const useMenuAction = (menuActions: any) => {
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
      return menuItemElement;
    });
  };

  return [callBackConfirmButton, onCloseMenu, onToggleMenu, isOpenMenu];
};

export const MenuAction: FC<any> = ({
  children,
  ActionsButton,
  isActionsLoading,
  callBackCloseMenu,
  isOpen,
  onToggle,
  ...rest
}) => {
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
};
