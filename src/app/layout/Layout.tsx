import React, { useEffect, useRef } from 'react';
import Axios from 'axios';
import { useAuthContext } from '@/app/auth/AuthContext';
import { Navbar } from '@/app/layout/Navbar';
import { Flex, SlideFade, useDisclosure } from '@chakra-ui/core';
import { useLocation } from 'react-router-dom';
import { Viewport } from '@/components/Viewport';
import { LoginModal } from '@/app/auth/LoginModal';

const LoginModalInterceptor = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { pathname } = useLocation();
  const pathnameRef = useRef(null);
  pathnameRef.current = pathname;

  useEffect(() => {
    Axios.interceptors.response.use(
      (r) => r,
      (error) => {
        if (
          error?.response?.status === 401 &&
          pathnameRef.current !== '/login'
        ) {
          onOpen();
        }
      }
    );
  }, [onOpen]);

  return <LoginModal isOpen={isOpen} onClose={onClose} />;
};

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
