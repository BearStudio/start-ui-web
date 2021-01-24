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
