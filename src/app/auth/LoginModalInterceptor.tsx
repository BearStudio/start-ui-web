import React, { useEffect, useRef } from 'react';

import {
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import Axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuthContext } from '@/app/auth/AuthContext';
import { LoginForm } from '@/app/auth/LoginForm';

export const LoginModalInterceptor = () => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isAuthenticated, updateToken } = useAuthContext();
  const queryCache = useQueryClient();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  useEffect(() => {
    const interceptor = Axios.interceptors.response.use(
      (r) => r,
      (error) => {
        if (
          error?.response?.status === 401 &&
          pathnameRef.current !== '/login'
        ) {
          queryCache.cancelQueries();
          onOpen();
        }
        throw error;
      }
    );

    return () => Axios.interceptors.response.eject(interceptor);
  }, [onOpen, updateToken, queryCache]);

  // On Route Change
  useEffect(() => {
    if (isOpen && pathname !== pathnameRef.current) {
      updateToken(null);
      onClose();
    }
  }, [isOpen, updateToken, onClose, pathname]);

  const handleLogin = () => {
    queryCache.refetchQueries();
    onClose();
  };

  const handleClose = () => {
    updateToken(null);
    onClose();
    navigate('/login');
  };

  return (
    <Modal
      isOpen={isOpen && isAuthenticated}
      onClose={handleClose}
      closeOnOverlayClick={false}
      trapFocus={false}
    >
      <ModalOverlay style={{ backdropFilter: 'blur(6px)' }} />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody p="6">
          <Heading size="lg">{t('auth:interceptor.title')}</Heading>
          <Text mb="2">{t('auth:interceptor.description')}</Text>
          <LoginForm onSuccess={handleLogin} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
