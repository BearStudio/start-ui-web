import React from 'react';

import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from '@chakra-ui/react';

import { MainMenu, useLayoutContext } from '@/app/layout';
import { Logo } from '@/components';

export const NavDrawer = ({ ...rest }) => {
  const { navIsOpen, navOnClose } = useLayoutContext();
  return (
    <Drawer
      isOpen={navIsOpen}
      placement="left"
      onClose={() => navOnClose?.()}
      {...rest}
    >
      <DrawerOverlay>
        <DrawerContent
          bg="gray.800"
          color="white"
          pt="safe-top"
          pb="safe-bottom"
        >
          <DrawerCloseButton mt="safe-top" />
          <DrawerHeader>
            <Logo h="1rem" color="gray.500" />
          </DrawerHeader>
          <DrawerBody p="2">
            <MainMenu direction="column" />
          </DrawerBody>
        </DrawerContent>
      </DrawerOverlay>
    </Drawer>
  );
};
