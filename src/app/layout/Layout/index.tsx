import React, { FC, useEffect, useState } from 'react';

import { Flex, useDisclosure } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';

import { useAuthContext } from '@/app/auth/AuthContext';
import { LoginModalInterceptor } from '@/app/auth/LoginModalInterceptor';
import { LayoutContext, TopBar } from '@/app/layout';
import { Viewport } from '@/components/Viewport';

export const Layout: FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const {
    isOpen: navIsOpen,
    onClose: navOnClose,
    onOpen: navOnOpen,
  } = useDisclosure();
  const { isAuthenticated } = useAuthContext();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <LayoutContext.Provider
      value={{ isFocusMode, setIsFocusMode, navIsOpen, navOnClose, navOnOpen }}
    >
      <Viewport>
        {isAuthenticated && !isFocusMode && <TopBar />}
        <Flex flex="1" direction="column">
          {children}
        </Flex>
        <LoginModalInterceptor />
      </Viewport>
    </LayoutContext.Provider>
  );
};
