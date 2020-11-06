import React, { useEffect, useRef } from 'react';
import Axios from 'axios';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useDisclosure,
} from '@chakra-ui/core';
import { useLocation } from 'react-router-dom';
import { useQueryCache } from 'react-query';
import { LoginForm } from '@/app/auth/LoginForm';

export const LoginModalInterceptor = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const queryCache = useQueryCache();
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
        throw error;
      }
    );
  }, [onOpen]);

  const onLogin = () => {
    queryCache.refetchQueries();
    onClose();
  };
  return (
    <Modal isOpen={isOpen} onClose={null}>
      <ModalOverlay />
      <ModalContent>
        <ModalBody p="6">
          <LoginForm onSuccess={onLogin} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
