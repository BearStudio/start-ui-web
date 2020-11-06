import React, { useEffect } from 'react';
import { useAuthContext } from '@/app/auth/AuthContext';
import { Navbar } from '@/app/layout/Navbar';
import { Flex, SlideFade } from '@chakra-ui/core';
import { useLocation } from 'react-router-dom';
import { Viewport } from '@/components/Viewport';
import { LoginModalInterceptor } from '@/app/auth/LoginModalInterceptor';

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
