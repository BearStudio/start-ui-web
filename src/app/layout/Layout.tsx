import React, { useEffect } from 'react';

import { Flex, SlideFade } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';

import { useAuthContext } from '@/app/auth/AuthContext';
import { LoginModalInterceptor } from '@/app/auth/LoginModalInterceptor';
import { Navbar } from '@/app/layout/Navbar';
import { Viewport } from '@/components';

export const Layout = ({ children }) => {
  const { isLogged } = useAuthContext();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Viewport>
      {isLogged && <Navbar />}
      <SlideFade
        in
        offsetY={-20}
        key={pathname}
        style={{ display: 'flex', flex: 1, flexDirection: 'column' }}
      >
        <Flex flex="1" direction="column">
          {children}
        </Flex>
      </SlideFade>
      <LoginModalInterceptor />
    </Viewport>
  );
};
