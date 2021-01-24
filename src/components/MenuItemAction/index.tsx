import React, { FC, useImperativeHandle } from 'react';

import {
  forwardRef,
  Box,
  MenuItemProps,
  MenuItem,
  Icon,
  Collapse,
  Heading,
  Flex,
  Button,
  useDisclosure,
} from '@chakra-ui/react';

interface IMenuItemProps extends MenuItemProps {
  propsActionHeader: any;
  propsConfirmButton: any;
  propsCancelButton: any;
  onCloseMenuAction: any;
  confirmationText: string;
  menuAction: {
    state: {
      isOpen: boolean;
      onToggle: any;
      onClose: any;
    };
    action: any;
  };
}

export const MenuItemAction: FC<any> = forwardRef(
  (
    {
      propsActionHeader,
      propsConfirmButton,
      propsCancelButton,
      onCloseMenuAction,
      confirmationText,
      actionCallBack,
      menuAction,
      ...rest
    },
    ref: any
  ) => {
    console.log({ state: menuAction.state });
    const { isOpen, onToggle } = menuAction.state || {
      isOpen: null,
      onToggle: null,
      onClose: null,
    };
    const { action } = menuAction;
    return (
      <>
        <MenuItem onClick={onToggle} {...rest}>
          {rest.text}
        </MenuItem>
        <Collapse in={isOpen} animateOpacity>
          <Box bg="gray.50" py="2" px="4">
            <Heading {...propsActionHeader} onClose={onCloseMenuAction}>
              {confirmationText}
            </Heading>
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
  }
);
