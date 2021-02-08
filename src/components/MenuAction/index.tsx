import React, { FC } from 'react';

import {
  Box,
  MenuItemProps,
  MenuItem,
  Collapse,
  Heading,
  Flex,
  Button,
  MenuProps,
  useDisclosure,
  Menu,
  MenuButton,
} from '@chakra-ui/react';

interface IMenuItemProps extends MenuItemProps {
  propsActionHeader: any;
  propsConfirmButton: any;
  propsCancelButton: any;
  confirmationText: string;
  text;
  actionCallBack: any;
  menuAction: {
    state: {
      isOpen: boolean;
      onToggle: any;
      onClose: any;
    };
    action: any;
  };
}

export const MenuActionItem: FC<IMenuItemProps> = ({
  propsActionHeader,
  propsConfirmButton,
  propsCancelButton,
  confirmationText,
  actionCallBack,
  menuAction,
  text,
  ...rest
}) => {
  const { isOpen, onToggle } = menuAction.state || {
    isOpen: null,
    onToggle: null,
    onClose: null,
  };
  return (
    <>
      <MenuItem onClick={onToggle} {...rest}>
        {text}
      </MenuItem>
      <Collapse in={isOpen} animateOpacity>
        <Box bg="gray.50" py="2" px="4">
          <Heading {...propsActionHeader}>{confirmationText}</Heading>
          <Flex>
            <Button {...propsCancelButton} onClick={onToggle}>
              {propsCancelButton.text}
            </Button>
            <Button {...propsConfirmButton} onClick={actionCallBack}>
              {propsConfirmButton.text}
            </Button>
          </Flex>
        </Box>
      </Collapse>
    </>
  );
};

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
    Object.values(menuActions || []).forEach((menuItemElement: any) => {
      menuItemElement?.state?.onClose();
    });
  };

  return { callBackConfirmButton, onCloseMenu, onToggleMenu, isOpenMenu };
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
