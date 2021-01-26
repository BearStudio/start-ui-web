import React, { FC } from 'react';

import {
  Box,
  MenuItemProps,
  MenuItem,
  Collapse,
  Heading,
  Flex,
  Button,
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

export const MenuItemAction: FC<IMenuItemProps> = ({
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
