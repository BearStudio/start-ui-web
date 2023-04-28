import React, { FC, useEffect, useMemo, useState } from 'react';

import { Flex, useDisclosure } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';

import { Viewport } from '@/components/Viewport';
import { useAuthContext } from '@/spa/auth/AuthContext';
import { LoginModalInterceptor } from '@/spa/auth/LoginModalInterceptor';
import { LayoutContext, TopBar } from '@/spa/layout';

export const Layout: FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const nav = useDisclosure();
  const { isAuthenticated } = useAuthContext();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const providerValue = useMemo(
    () => ({
      isFocusMode,
      setIsFocusMode,
      navIsOpen: nav.isOpen,
      navOnClose: nav.onClose,
      navOnOpen: nav.onOpen,
    }),
    [isFocusMode, nav.isOpen, nav.onClose, nav.onOpen]
  );

  return (
    <LayoutContext.Provider value={providerValue}>
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
