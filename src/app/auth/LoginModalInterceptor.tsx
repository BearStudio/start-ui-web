import React, { useEffect, useRef } from 'react';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Heading,
  Text,
} from '@chakra-ui/react';
import Axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useLocation, useHistory } from 'react-router-dom';

import { useAuthContext } from '@/app/auth/AuthContext';
import { LoginForm } from '@/app/auth/LoginForm';

export const LoginModalInterceptor = () => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isLogged, updateToken } = useAuthContext();
  const queryCache = useQueryClient();
  const history = useHistory();
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
          queryCache.cancelQueries();
          onOpen();
        }
        throw error;
      }
    );
  }, [onOpen, updateToken, queryCache]);

  // On Route Change
  useEffect(() => {
    const destroy = history.listen(() => {
      if (isOpen) {
        updateToken(null);
        onClose();
      }
    });

    return () => destroy();
  }, [history, isOpen, updateToken, onClose]);

  const handleLogin = () => {
    queryCache.refetchQueries();
    onClose();
  };

  const handleClose = () => {
    updateToken(null);
    onClose();
    history.push('/login');
  };

  return (
    <Modal
      isOpen={isOpen && isLogged}
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
