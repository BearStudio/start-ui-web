import React, { useEffect, useState } from 'react';

import { Flex, useDisclosure } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';

import { useAuthContext } from '@/app/auth/AuthContext';
import { LoginModalInterceptor } from '@/app/auth/LoginModalInterceptor';
import { TopBar, LayoutContext } from '@/app/layout';
import { Viewport } from '@/components';

export const Layout = ({ children }) => {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const {
    isOpen: navIsOpen,
    onClose: navOnClose,
    onOpen: navOnOpen,
  } = useDisclosure();
  const { isLogged } = useAuthContext();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <LayoutContext.Provider
      value={{ isFocusMode, setIsFocusMode, navIsOpen, navOnClose, navOnOpen }}
    >
      <Viewport>
        {isLogged && !isFocusMode && <TopBar />}
        <Flex flex="1" direction="column">
          {children}
        </Flex>
        <LoginModalInterceptor />
      </Viewport>
    </LayoutContext.Provider>
  );
};
